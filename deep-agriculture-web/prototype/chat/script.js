// script.js
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const chatHistory = document.getElementById('chat-history');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const welcomeScreen = document.getElementById('welcome-screen');
    const chatHistoryWrapper = document.querySelector('.chat-history-wrapper');
    const functionTogglesContainer = document.getElementById('function-toggles');
    const aiMessageTemplate = document.getElementById('ai-message-template');
    const userMessageTemplate = document.getElementById('user-message-template');
    const uploadImageBtn = document.getElementById('upload-image');
    const uploadFileBtn = document.getElementById('upload-file');
    const imageInput = document.getElementById('image-input');
    const fileInput = document.getElementById('file-input');
    const previewArea = document.getElementById('preview-area');

    // --- State Variables ---
    let conversationStarted = false;
    let isDeepThoughtActive = false; // Tracks the "深度思考" toggle state
    let uploadedFiles = []; // Tracks uploaded files and images
    let currentChatId = Date.now(); // 当前对话的唯一标识

    // --- Initial Setup ---
    feather.replace(); // Render Feather icons
    autoResizeTextarea(userInput); // Adjust textarea size initially
    // Welcome screen is shown by default via CSS

    // 新建对话按钮点击事件
    const newChatBtn = document.querySelector('.new-chat-btn');
    const historyPreview = document.querySelector('.history-preview');

    newChatBtn.addEventListener('click', () => {
        // 如果有对话内容，保存到历史记录
        if (conversationStarted) {
            saveCurrentChat();
        }

        // 重置对话区域
        resetChatArea();
    });

    // 保存当前对话到历史记录
    function saveCurrentChat() {
        const messages = chatHistory.querySelectorAll('.message');
        if (messages.length === 0) return;

        // 获取第一条消息作为对话标题
        const firstMessage = messages[0].querySelector('.message-content');
        const title = firstMessage ? firstMessage.textContent.slice(0, 20) + '...' : '新对话';

        // 创建新的历史记录项
        const today = new Date();
        const timeGroup = getTimeGroup(today);
        
        // 查找或创建时间分组
        let timeGroupElement = findOrCreateTimeGroup(timeGroup);
        
        // 创建新的对话记录项
        const newHistoryItem = document.createElement('li');
        newHistoryItem.innerHTML = `<a href="#">${title}</a>`;
        newHistoryItem.dataset.chatId = currentChatId;
        
        // 将新对话添加到分组中
        timeGroupElement.querySelector('.history-list').insertBefore(
            newHistoryItem,
            timeGroupElement.querySelector('.history-list').firstChild
        );

        // 保存聊天内容到localStorage
        const chatContent = [];
        messages.forEach(message => {
            const type = message.classList.contains('user-message') ? 'user' : 'ai';
            const content = message.querySelector('.message-content').innerHTML;
            chatContent.push({ type, content });
        });
        localStorage.setItem(`chat_${currentChatId}`, JSON.stringify(chatContent));

        // 添加点击事件监听器
        newHistoryItem.addEventListener('click', () => {
            loadChat(currentChatId);
        });

        // 为所有历史记录项添加点击事件
        document.querySelectorAll('.history-list li').forEach(item => {
            if (!item.hasClickListener) {
                item.hasClickListener = true;
                item.addEventListener('click', () => {
                    if (item.dataset.chatId) {
                        loadChat(item.dataset.chatId);
                    }
                });
            }
        });
    }

    // 获取时间分组
    function getTimeGroup(date) {
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return '当天';
        if (diffDays <= 30) return '最近30天';
        return '最近半年';
    }

    // 查找或创建时间分组
    function findOrCreateTimeGroup(groupName) {
        let group = Array.from(historyPreview.children).find(
            el => el.querySelector('.history-timeframe')?.textContent === groupName
        );

        if (!group) {
            group = document.createElement('div');
            group.className = 'history-group';
            group.innerHTML = `
                <span class="history-timeframe">${groupName}</span>
                <ul class="history-list"></ul>
            `;
            historyPreview.insertBefore(group, historyPreview.firstChild);
        }

        return group;
    }

    // 重置对话区域
    function resetChatArea() {
        // 清空对话历史
        while (chatHistory.firstChild) {
            chatHistory.removeChild(chatHistory.firstChild);
        }

        // 显示欢迎界面
        welcomeScreen.style.display = 'block';
        conversationStarted = false;

        // 清空输入框和预览区域
        userInput.value = '';
        previewArea.innerHTML = '';
        uploadedFiles = [];

        // 重置功能按钮状态
        const activeButtons = functionTogglesContainer.querySelectorAll('button.active');
        activeButtons.forEach(button => {
            button.classList.remove('active');
            button.setAttribute('aria-pressed', 'false');
        });
        isDeepThoughtActive = false;

        // 生成新的对话ID
        currentChatId = Date.now();
    }

    // File Upload Event Listeners
    uploadImageBtn.addEventListener('click', () => imageInput.click());
    uploadFileBtn.addEventListener('click', () => fileInput.click());

    imageInput.addEventListener('change', handleImageUpload);
    fileInput.addEventListener('change', handleFileUpload);

    // File Upload Functions
    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewItem = createPreviewItem('image', {
                    src: e.target.result,
                    name: file.name
                });
                previewArea.appendChild(previewItem);
                uploadedFiles.push({
                    type: 'image',
                    file: file,
                    element: previewItem
                });
            };
            reader.readAsDataURL(file);
        }
        event.target.value = ''; // Reset input
    }

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const previewItem = createPreviewItem('file', {
            name: file.name,
            type: file.type
        });
        previewArea.appendChild(previewItem);
        uploadedFiles.push({
            type: 'file',
            file: file,
            element: previewItem
        });
        event.target.value = ''; // Reset input
    }

    function createPreviewItem(type, data) {
        const div = document.createElement('div');
        div.className = 'preview-item';

        if (type === 'image') {
            const img = document.createElement('img');
            img.src = data.src;
            img.alt = data.name;
            div.appendChild(img);
        } else {
            const filePreview = document.createElement('div');
            filePreview.className = 'file-preview';
            const icon = document.createElement('i');
            icon.setAttribute('data-feather', 'file-text');
            const name = document.createElement('span');
            name.textContent = data.name.length > 15 ? data.name.substring(0, 12) + '...' : data.name;
            filePreview.appendChild(icon);
            filePreview.appendChild(name);
            div.appendChild(filePreview);
        }

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-preview';
        removeBtn.innerHTML = '×';
        removeBtn.onclick = () => {
            const index = uploadedFiles.findIndex(f => f.element === div);
            if (index > -1) {
                uploadedFiles.splice(index, 1);
            }
            div.remove();
        };
        div.appendChild(removeBtn);
        feather.replace();
        return div;
    }

    // --- Event Listeners ---

    // Send message on button click
    sendButton.addEventListener('click', handleSendMessage);

    // Send message on Enter key (but not Shift+Enter)
    userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Prevent default newline
            handleSendMessage();
        }
    });

    // Event delegation for thinking panel toggle within chat history
    chatHistory.addEventListener('click', (event) => {
        const thinkingHeader = event.target.closest('.thinking-header');
        if (thinkingHeader) {
            toggleThinkingPanel(thinkingHeader);
        }
        // Optional: Handle clicks on welcome screen suggestions
        const suggestion = event.target.closest('.tool-item, .try-visual-btn, .agent-item');
         if (suggestion && !conversationStarted && welcomeScreen && !welcomeScreen.classList.contains('hidden')) {
            let prompt = "请介绍一下 ";
             if (suggestion.matches('.tool-item')) prompt += suggestion.querySelector('div').textContent.trim();
             else if (suggestion.matches('.try-visual-btn')) prompt += "通义万相视频";
             else if (suggestion.matches('.agent-item')) prompt += suggestion.querySelector('h4').textContent.trim();
             else prompt = "你好！"; // Default prompt

             userInput.value = prompt;
             userInput.focus();
        }
    });

    // Event listener for function toggle buttons
    functionTogglesContainer.addEventListener('click', (event) => {
        const clickedButton = event.target.closest('button');
        if (!clickedButton) return;

        const mode = clickedButton.dataset.mode;
        const currentlyActive = clickedButton.classList.contains('active');
        const isActive = !currentlyActive; // The new state

        // Toggle visual state
        clickedButton.classList.toggle('active', isActive);
        clickedButton.setAttribute('aria-pressed', String(isActive));

        // Update internal state *specifically* for deep thought
        if (mode === 'deep-thought') {
            isDeepThoughtActive = isActive;
            console.log("深度思考模式:", isDeepThoughtActive ? "开启" : "关闭");
        }

        // If you want toggles to be exclusive (only one active at a time)
        // Uncomment the following block:
        /*
        if (isActive) { // If we just activated this button
            const allButtons = functionTogglesContainer.querySelectorAll('button');
            allButtons.forEach(button => {
                if (button !== clickedButton && button.classList.contains('active')) {
                    button.classList.remove('active');
                    button.setAttribute('aria-pressed', 'false');
                    // If deactivating deep thought because another button was clicked
                    if (button.dataset.mode === 'deep-thought') {
                        isDeepThoughtActive = false;
                         console.log("深度思考模式因切换关闭");
                    }
                }
            });
        }
        */
    });

    // Auto-resize textarea on input
    userInput.addEventListener('input', () => { autoResizeTextarea(userInput); });

    // --- Core Functions ---

    /**
     * Handles sending the user's message.
     */
    function handleSendMessage() {
        const query = userInput.value.trim();
        if (!query && uploadedFiles.length === 0) return; // Don't send empty messages without attachments

        // Hide welcome screen on first message
        if (!conversationStarted) {
            hideWelcomeScreen();
            conversationStarted = true;
        }

        // Create message content with attachments
        const messageContent = document.createElement('div');
        if (query) {
            const textContent = document.createElement('p');
            textContent.textContent = query;
            messageContent.appendChild(textContent);
        }

        // Add attachments if any
        if (uploadedFiles.length > 0) {
            const attachmentsDiv = document.createElement('div');
            attachmentsDiv.className = 'message-attachments';

            uploadedFiles.forEach(file => {
                const attachmentDiv = document.createElement('div');
                attachmentDiv.className = 'attachment-item';

                if (file.type === 'image') {
                    const img = document.createElement('img');
                    img.src = file.element.querySelector('img').src;
                    img.alt = file.file.name;
                    img.className = 'attachment-image';
                    attachmentDiv.appendChild(img);
                } else {
                    const fileIcon = document.createElement('i');
                    fileIcon.setAttribute('data-feather', 'file-text');
                    const fileName = document.createElement('span');
                    fileName.textContent = file.file.name;
                    fileName.className = 'attachment-filename';
                    attachmentDiv.appendChild(fileIcon);
                    attachmentDiv.appendChild(fileName);
                }

                attachmentsDiv.appendChild(attachmentDiv);
            });

            messageContent.appendChild(attachmentsDiv);
        }

        displayUserMessage(messageContent.innerHTML); // Show user's message with attachments
        userInput.value = ''; // Clear input
        autoResizeTextarea(userInput); // Reset textarea height

        // Clear preview area and uploaded files array
        previewArea.innerHTML = '';
        uploadedFiles = [];

        // Trigger AI response simulation, passing the deep thought state
        simulateAIResponse(query, isDeepThoughtActive);

        // Update Feather icons for any new file icons
        feather.replace();
    }

    /**
     * Hides the initial welcome screen.
     */
    function hideWelcomeScreen() {
        if (welcomeScreen) {
            welcomeScreen.classList.add('hidden');
        }
    }

    /**
     * Displays a message from the user in the chat history.
     * @param {string} text - The user's message text.
     */
    function displayUserMessage(text) {
        const messageNode = userMessageTemplate.content.cloneNode(true);
        const messageContent = messageNode.querySelector('.message-content');
        messageContent.innerHTML = text; // Use innerHTML to properly render HTML content like attachments
        chatHistory.appendChild(messageNode);
        scrollToBottom();
        // Update any Feather icons in the newly added message
        feather.replace();
    }

    /**
     * Displays a message from the AI, potentially including a thinking panel.
     * @param {object} initialState - Initial content { thinking, steps, answer }.
     * @param {boolean} showThinkingPanel - Whether to render the thinking panel structure.
     * @returns {string} The unique ID assigned to the AI message element.
     */
    function displayAIMessage(initialState = { thinking: true, steps: ["正在分析您的问题..."], answer: "..." }, showThinkingPanel = true) {
        const messageNode = aiMessageTemplate.content.cloneNode(true);
        const messageDiv = messageNode.querySelector('.message');
        const thinkingProcessDiv = messageNode.querySelector('.thinking-process');
        const answerDiv = messageNode.querySelector('.ai-answer');
        const messageId = `ai-msg-${Date.now()}`;
        messageDiv.id = messageId; // Assign unique ID

        if (showThinkingPanel && initialState.thinking && thinkingProcessDiv) {
            // Configure thinking state (only if panel exists in template)
            const thinkingHeader = thinkingProcessDiv.querySelector('.thinking-header');
            const thinkingStatus = thinkingProcessDiv.querySelector('.thinking-status');
            const thinkingDetails = thinkingProcessDiv.querySelector('.thinking-details');
            const toggleIcon = thinkingProcessDiv.querySelector('.toggle-thinking i');

            thinkingStatus.textContent = 'AI 正在思考...';
            thinkingDetails.innerHTML = initialState.steps.map(step => `<p>${escapeHTML(step)}</p>`).join('');
            answerDiv.innerHTML = initialState.answer; // Placeholder answer
            thinkingHeader.setAttribute('aria-expanded', 'false');
            if (toggleIcon) toggleIcon.setAttribute('data-feather', 'chevron-down');

        } else {
            // Not showing thinking panel or starting directly with answer
            if (thinkingProcessDiv) thinkingProcessDiv.remove(); // Remove panel if it exists
            answerDiv.innerHTML = formatAnswer(initialState.answer || "..."); // Show answer directly
        }

        chatHistory.appendChild(messageNode);
        feather.replace(); // Render any new icons
        scrollToBottom();
        return messageId;
    }

    /**
     * Updates an existing AI message with new thinking steps or the final answer.
     * @param {string} messageId - The ID of the message element to update.
     * @param {object} updateData - Data to update { steps?, answer? }.
     * @param {boolean} showThinkingPanel - Whether the thinking panel should be visible.
     */
    function updateAIMessage(messageId, updateData = { steps: [], answer: null }, showThinkingPanel = true) {
        const messageDiv = document.getElementById(messageId);
        if (!messageDiv) return;

        const thinkingProcessDiv = messageDiv.querySelector('.thinking-process');
        const answerDiv = messageDiv.querySelector('.ai-answer');

        // Update Thinking Steps if panel should be shown and exists
        if (showThinkingPanel && thinkingProcessDiv && updateData.steps && updateData.steps.length > 0) {
            const thinkingDetails = thinkingProcessDiv.querySelector('.thinking-details');
            const thinkingStatus = thinkingProcessDiv.querySelector('.thinking-status');
            if (thinkingDetails) thinkingDetails.innerHTML = updateData.steps.map(step => `<p>${escapeHTML(step)}</p>`).join('');
            if (thinkingStatus) thinkingStatus.textContent = "思考过程"; // Update status text
        } else if (!showThinkingPanel && thinkingProcessDiv) {
            // Remove thinking panel if it exists but shouldn't be shown
            thinkingProcessDiv.remove();
        }

        // Update Final Answer if provided
        if (answerDiv && updateData.answer !== null) {
            answerDiv.innerHTML = formatAnswer(updateData.answer); // Format and set final answer

            // Ensure correct DOM order if thinking panel is present
             if (showThinkingPanel && thinkingProcessDiv && answerDiv.parentNode) {
                  if (!thinkingProcessDiv.nextElementSibling || thinkingProcessDiv.nextElementSibling !== answerDiv) {
                       answerDiv.parentNode.insertBefore(thinkingProcessDiv, answerDiv); // Place thinking before answer
                  }
             }
        }

        feather.replace(); // Update icons (e.g., toggle state might change)
        scrollToBottom();
    }

    /**
     * Simulates the AI generating a response, showing thinking steps conditionally.
     * @param {string} query - The user's query.
     * @param {boolean} deepThoughtEnabled - Whether the "深度思考" mode is active.
     */
    function simulateAIResponse(query, deepThoughtEnabled) {
        console.log(`模拟回应，深度思考: ${deepThoughtEnabled}`);

        const initialSteps = deepThoughtEnabled ? ["理解用户意图...", `分析查询内容：“${escapeHTML(query.substring(0, 50))}${query.length > 50 ? '...' : ''}”`] : [];
        const initialAnswer = deepThoughtEnabled ? "..." : "正在快速处理...";
        const messageId = displayAIMessage(
            { thinking: deepThoughtEnabled, steps: initialSteps, answer: initialAnswer },
            deepThoughtEnabled // Only show thinking panel if deep thought is on
        );

        // --- Quick Response Path ---
        if (!deepThoughtEnabled) {
            setTimeout(() => {
                const finalAnswer = generateDummyResponse(query, false);
                updateAIMessage(messageId, { answer: finalAnswer }, false); // Update message, hiding thinking panel
            }, 500 + Math.random() * 300);
            return; // Exit simulation early
        }

        // --- Deep Thought Simulation Path ---
        let currentSteps = [...initialSteps];
        const thinkingPhases = [ // More detailed steps for deep thought
            "检索相关知识库...",
            "从不同角度进行分析与推理...",
            "整合关键信息，形成初步观点...",
            "评估逻辑连贯性与潜在偏差...",
            "优化语言表达，确保清晰准确..."
        ];
        let phaseIndex = 0;

        const intervalId = setInterval(() => {
            if (phaseIndex < thinkingPhases.length) {
                currentSteps.push(thinkingPhases[phaseIndex]);
                updateAIMessage(messageId, { steps: currentSteps }, true); // Update thinking steps

                // Auto-expand panel on first update
                 if (phaseIndex === 0) {
                    const header = document.querySelector(`#${messageId} .thinking-header`);
                    if (header && header.getAttribute('aria-expanded') === 'false') {
                         toggleThinkingPanel(header, true);
                    }
                }
                phaseIndex++;
            } else {
                clearInterval(intervalId); // Thinking complete
                const finalAnswer = generateDummyResponse(query, true); // Generate deep thought response
                updateAIMessage(messageId, { steps: currentSteps, answer: finalAnswer }, true); // Show final answer and steps
            }
        }, 700 + Math.random() * 500); // Slower interval for "deep" thinking
    }

    /**
     * Generates a dummy AI response based on the query and thinking mode.
     * @param {string} query - User query.
     * @param {boolean} isDeepThought - Whether deep thought mode was active.
     * @returns {string} The mock AI response text.
     */
    function generateDummyResponse(query, isDeepThought) {
         query = query.toLowerCase();
         let prefix = isDeepThought ? "【深度思考模式】\n" : ""; // Prefix response based on mode

         if (query.includes("你好") || query.includes("hello")) {
             return prefix + "你好！很高兴为您服务。有什么我可以帮您的吗？";
         } else if (query.includes("你是谁") || query.includes("介绍你自己")) {
             return prefix + "我是通义千问，一个由阿里巴巴通义实验室研发的超大规模语言模型。\n" + (isDeepThought ? "我经过了广泛的训练，能够进行复杂的语言理解、生成和多轮对话交互，旨在提供更深入、全面和富有洞察力的信息。" : "我可以回答问题、进行对话和协助完成多种任务。");
         } else if (query.includes("天气")) {
             return prefix + "抱歉，我目前无法直接查询实时天气信息。\n为了获取最准确的天气情况，建议您使用专业的天气服务平台。";
         } else if (query.includes("万相视频")) {
              return prefix + "通义万相是阿里巴巴推出的先进AI创作平台，其视频生成功能利用了前沿的扩散模型技术。\n\n" + (isDeepThought ? "在深度思考模式下，我可以为您阐述更多技术细节，例如潜在空间表示、文本到视频的对齐机制、以及训练数据的多样性对生成效果的影响等。总的来说，它通过学习海量数据，掌握了从文本或图像描述生成连贯、高质量视频内容的能力。\n" : "它支持文生视频、图生视频等创作方式，让用户能便捷地将创意转化为动态影像。\n") + "您可以在通义官网体验。";
         } else if (query.includes("代码") || query.includes("python")) {
             return prefix + `当然，我可以帮您编写代码。\n这是一个 Python 函数示例，用于演示基本结构：\n\`\`\`python\n# ${isDeepThought ? "深度思考提供的代码示例" : "代码示例"}\ndef calculate_sum(a, b):\n    """计算两个数字的和"""\n    # 在深度模式下，可能会添加更详细的注释或错误处理\n    if not (isinstance(a, (int, float)) and isinstance(b, (int, float))):\n        raise TypeError("输入参数必须是数字")\n    result = a + b\n    print(f"{a} + {b} = {result}")\n    return result\n\n# 调用示例\ncalculate_sum(15, 27)\n\`\`\`\n请告诉我您需要实现什么具体功能的代码，我会尽力协助。`;
         } else {
             return prefix + `关于您提到的“${escapeHTML(query)}”...\n\n` + (isDeepThought ? "在深度思考模式下，我会结合我的知识库进行多维度分析，并尝试提供一个结构化、信息丰富的回答。这可能需要稍多一点时间来处理。" : "我将查找相关信息并尽快给您答复。");
         }
     }


    // --- Helper Functions ---

    /**
     * Formats raw text answer for display (HTML escape, newlines, code blocks).
     * @param {string} rawAnswer - The raw text.
     * @returns {string} HTML formatted string.
     */
    function formatAnswer(rawAnswer) {
         let formatted = escapeHTML(rawAnswer);
         formatted = formatted.replace(/\n/g, '<br>');
         // Improved regex for code blocks, handling optional language and ensuring clôture
         formatted = formatted.replace(/```(\w*?)\s*<br>([\s\S]*?)<br>\s*```/g, (match, lang, code) => {
             let cleanCode = code.replace(/^<br>|<br>$/g, ''); // Trim surrounding breaks
             return `<pre><code class="language-${lang || 'plaintext'}">${cleanCode}</code></pre>`;
         });
          formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>'); // Inline code
         return formatted;
     }

    /**
     * Toggles the visibility of the thinking details panel.
     * @param {HTMLElement} header - The header element of the thinking panel.
     * @param {boolean|null} forceState - Optional: true to expand, false to collapse.
     */
    function toggleThinkingPanel(header, forceState = null) {
        const details = header.nextElementSibling; // Assumes details div follows header
        const toggleIcon = header.querySelector('.toggle-thinking i');
        if (!details || !toggleIcon) return;

        const isExpanded = details.classList.contains('expanded');
        const expand = forceState !== null ? forceState : !isExpanded; // Determine target state

        details.classList.toggle('expanded', expand);
        header.setAttribute('aria-expanded', String(expand)); // Update ARIA state
        // Update icon direction based on the new state
        toggleIcon.setAttribute('data-feather', expand ? 'chevron-up' : 'chevron-down');
        feather.replace(); // Re-render the changed icon
    }

    /**
     * Adjusts textarea height automatically based on content.
     * @param {HTMLTextAreaElement} textarea - The textarea element.
     */
    function autoResizeTextarea(textarea) {
        textarea.style.height = 'auto'; // Temporarily shrink to base height
        const maxHeight = 110; // Match CSS max-height
        const scrollHeight = textarea.scrollHeight;
        if (scrollHeight > maxHeight) {
            textarea.style.height = `${maxHeight}px`; // Set fixed max height
            textarea.style.overflowY = 'auto'; // Show scrollbar if needed
        } else {
            textarea.style.height = `${scrollHeight}px`; // Grow to content height
            textarea.style.overflowY = 'hidden'; // Hide scrollbar if not needed
        }
    }

    // 加载保存的聊天内容
    function loadChat(chatId) {
        const savedChat = localStorage.getItem(`chat_${chatId}`);
        if (!savedChat) return;

        // 清空当前对话
        while (chatHistory.firstChild) {
            chatHistory.removeChild(chatHistory.firstChild);
        }

        // 隐藏欢迎界面
        welcomeScreen.style.display = 'none';
        welcomeScreen.classList.add('hidden');
        conversationStarted = true;

        // 恢复聊天内容
        const messages = JSON.parse(savedChat);
        messages.forEach(message => {
            if (message.type === 'user') {
                const messageNode = userMessageTemplate.content.cloneNode(true);
                const messageContent = messageNode.querySelector('.message-content');
                messageContent.innerHTML = message.content;
                chatHistory.appendChild(messageNode);
            } else {
                const messageNode = aiMessageTemplate.content.cloneNode(true);
                const messageContent = messageNode.querySelector('.message-content');
                messageContent.innerHTML = message.content;
                chatHistory.appendChild(messageNode);
            }
        });

        // 更新当前对话ID
        currentChatId = chatId;

        // 滚动到底部
        chatHistory.scrollTop = chatHistory.scrollHeight;
        
        // 更新Feather图标
        feather.replace();
    }

    /**
     * Scrolls the chat history to the bottom smoothly.
     */
    function scrollToBottom() {
        if (chatHistoryWrapper) {
            // 使用requestAnimationFrame确保在DOM更新后执行滚动
            requestAnimationFrame(() => {
                chatHistoryWrapper.scrollTo({
                    top: chatHistoryWrapper.scrollHeight,
                    behavior: 'smooth'
                });
            });
        }
    }

    /**
     * Escapes special HTML characters to prevent XSS.
     * @param {string} str - The input string.
     * @returns {string} The escaped string.
     */
    function escapeHTML(str) {
        if (!str) return '';
        return str;
    }
});