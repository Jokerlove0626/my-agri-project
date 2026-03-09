// =============================================== //
// == Entry Form Page Script (entry_form_script.js) == //
// =============================================== //

console.log("Entry form script loaded.");

/**
 * 通用函数：移除动态添加的条目
 * @param {HTMLElement} buttonElement - 被点击的移除按钮元素
 */
function removeEntryItem(buttonElement) {
    // 找到按钮所在的条目容器 (通常是父级的父级或特定类名的祖先)
    const entryItem = buttonElement.closest('.entry-item');
    if (entryItem) {
        console.log("Removing entry item:", entryItem);
        entryItem.remove(); // 从 DOM 中移除该条目
    } else {
        console.error("Could not find parent '.entry-item' for remove button.");
    }
}

/**
 * 添加地理分布记录条目
 */
function addDistributionEntry() {
    const container = document.getElementById('distributionEntries');
    if (!container) {
        console.error("Container '#distributionEntries' not found.");
        return;
    }

    // 创建新的条目 div
    const newItem = document.createElement('div');
    newItem.className = 'entry-item form-grid'; // 使用与现有条目相同的类

    // 填充 HTML 内容 (注意 name 属性数组表示)
    newItem.innerHTML = `
        <div class="form-group">
            <label>大陆名称:</label>
            <input type="text" name="distribution_continent_name[]" value="">
        </div>
        <div class="form-group">
            <label>国家名称:</label>
            <input type="text" name="distribution_country_name[]" value="">
        </div>
        <div class="form-group">
            <label>省份/州名称:</label>
            <input type="text" name="distribution_province_name[]" value="">
        </div>
        <div class="form-group full-width">
            <label>分布状态描述:</label>
            <input type="text" name="distribution_description[]" value="">
        </div>
        <button type="button" class="remove-button" onclick="removeEntryItem(this)"><i class="fas fa-trash-alt"></i> 移除</button>
    `;

    container.appendChild(newItem); // 将新条目添加到容器中
    console.log("Added new distribution entry.");
}

/**
 * 添加寄主记录条目
 */
function addHostEntry() {
    const container = document.getElementById('hostEntries');
    if (!container) return;

    const newItem = document.createElement('div');
    newItem.className = 'entry-item form-grid';
    newItem.innerHTML = `
        <div class="form-group"> <label>寄主学名:</label> <input type="text" name="host_name[]" required> </div>
        <div class="form-group"> <label>寄主中文名:</label> <input type="text" name="host_name_cn[]"> </div>
        <div class="form-group">
            <label>寄主类型:</label>
            <input type="text" name="host_types[]" placeholder="逗号分隔, 如: 自然寄主">
        </div>
        <div class="form-group">
            <label>互作关系:</label>
            <select name="interaction_type[]">
                <option value="primary">主要 (primary)</option>
                <option value="secondary">次要 (secondary)</option>
                <option value="occasional">偶发 (occasional)</option>
            </select>
        </div>
        <div class="form-group"> <label>危害植物部位:</label> <input type="text" name="plant_parts[]" placeholder="逗号分隔, 如: 木质部,枝条"> </div>
        <div class="form-group">
             <label>侵染强度:</label>
             <select name="infection_intensity[]">
                 <option value="">未指定</option>
                 <option value="low">低 (low)</option>
                 <option value="medium">中 (medium)</option>
                 <option value="high">高 (high)</option>
             </select>
         </div>
         <button type="button" class="remove-button" onclick="removeEntryItem(this)"><i class="fas fa-trash-alt"></i> 移除</button>
    `;
    container.appendChild(newItem);
    console.log("Added new host entry.");
}

/**
 * 添加其他名称条目
 */
function addOtherNameEntry() {
     const container = document.getElementById('otherNameEntries');
    if (!container) return;

    const newItem = document.createElement('div');
    newItem.className = 'entry-item form-grid';
    newItem.innerHTML = `
        <div class="form-group">
            <label>名称类型:</label>
            <input type="text" name="other_name_type[]" placeholder="如: 异名, 曾用名">
        </div>
        <div class="form-group">
            <label>其他名称:</label>
            <input type="text" name="other_name[]">
        </div>
        <div class="form-group">
            <label>命名年份:</label>
            <input type="text" name="named_year[]">
        </div>
        <button type="button" class="remove-button" onclick="removeEntryItem(this)"><i class="fas fa-trash-alt"></i> 移除</button>
    `;
    container.appendChild(newItem);
    console.log("Added new other name entry.");
}

/**
 * 添加图片信息条目
 */
function addImageEntry() {
     const container = document.getElementById('imageEntries');
     if (!container) return;

     const newItem = document.createElement('div');
     newItem.className = 'entry-item form-grid';
     newItem.innerHTML = `
         <div class="form-group"> <label>图片标题:</label> <input type="text" name="image_title[]"> </div>
         <div class="form-group"> <label>图片类型:</label> <input type="text" name="image_type[]" placeholder="如: 显微图, 生态图"> </div>
         <div class="form-group"> <label>存储路径:</label> <input type="text" name="image_path[]" placeholder="相对或绝对路径"> </div>
         <div class="form-group full-width"> <label>内容描述:</label> <textarea name="image_content_description[]" rows="2"></textarea> </div>
         <div class="form-group full-width"> <label>版权信息:</label> <textarea name="image_copyright_description[]" rows="1"></textarea> </div>
         <div class="form-group"> <label>排序权重:</label> <input type="number" name="image_order_by[]" value="0" min="0"> </div>
         <div class="form-group"> <label>首页展示:</label> <select name="image_is_home_show[]"><option value="0">否</option><option value="1">是</option></select> </div>
         <button type="button" class="remove-button" onclick="removeEntryItem(this)"><i class="fas fa-trash-alt"></i> 移除</button>
     `;
     container.appendChild(newItem);
     console.log("Added new image entry.");
}

/**
 * 添加关联文献引用条目
 */
 function addReferenceEntry() {
     const container = document.getElementById('referenceEntries');
     if (!container) return;

     const newItem = document.createElement('div');
     newItem.className = 'entry-item form-grid';
     newItem.innerHTML = `
         <div class="form-group"> <label>文献标识码(icode):</label> <input type="number" name="ref_icode[]" required> </div>
         <div class="form-group"> <label>文献标题:</label> <input type="text" name="ref_title[]"> </div>
         <div class="form-group"> <label>作者显示(含年份):</label> <input type="text" name="ref_author_display[]"> </div>
         <div class="form-group">
            <label>引用类型:</label>
            <select name="ref_reference_type[]">
                <option value="distribution">分布 (distribution)</option>
                <option value="biology">生物学 (biology)</option>
                <option value="control">防治 (control)</option>
            </select>
        </div>
         <div class="form-group full-width"> <label>文献在线链接(URL):</label> <input type="url" name="ref_url[]" placeholder="可选"> </div>
         <button type="button" class="remove-button" onclick="removeEntryItem(this)"><i class="fas fa-trash-alt"></i> 移除</button>
     `;
     container.appendChild(newItem);
     console.log("Added new reference entry.");
 }


// 表单提交处理 (示例)
const entryForm = document.getElementById('entryForm');
if (entryForm) {
    entryForm.addEventListener('submit', function(event) {
        event.preventDefault(); // 阻止默认的表单提交行为
        console.log("Form submission initiated...");

        // 在实际应用中，这里会收集表单数据
        const formData = new FormData(this);

        // 示例：将 FormData 转换为 JSON 对象 (需要更复杂的处理来正确处理数组)
        const formObject = {};
        formData.forEach((value, key) => {
            // 简单的处理，实际需要处理数组 name[]
            if (!formObject[key]) {
                formObject[key] = value;
            } else if (Array.isArray(formObject[key])) {
                formObject[key].push(value);
            } else {
                formObject[key] = [formObject[key], value];
            }
             // TODO: 更精细地处理动态添加的数组字段，可能需要根据 name[] 结构化数据
        });

        console.log("Form Data (Simplified):", formObject);

        // 在实际应用中，将 formObject 发送到后端 API
        // fetch('/api/save-species', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(formObject)
        // })
        // .then(response => response.json())
        // .then(data => {
        //     console.log("Success:", data);
        //     alert("数据保存成功！");
        // })
        // .catch((error) => {
        //     console.error("Error:", error);
        //      alert("数据保存失败！");
        // });

        alert("表单提交（原型）- 数据已在控制台输出。");
    });
}