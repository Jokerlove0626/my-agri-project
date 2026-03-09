document.addEventListener('DOMContentLoaded', () => {
    // 交互功能 - 示例: Filter group toggle
    const filterGroups = document.querySelectorAll('.filter-group summary');

    filterGroups.forEach(summary => {
        // No need to manually toggle 'open' attribute if using <details>
        // The browser handles it automatically.
        // We could add custom animations or logic here if needed.
    });

    // 示例: 按钮点击效果 (可以添加实际的搜索/筛选逻辑)
    const searchButton = document.querySelector('.search-button');
    const resetButton = document.querySelector('.reset-button');
    const applyButton = document.querySelector('.apply-button');
    const detailButtons = document.querySelectorAll('.details-button');

    if (searchButton) {
        searchButton.addEventListener('click', () => {
            console.log('Search initiated...');
            // 在这里添加调用后端 API 发起搜索的逻辑
            // 暂时可以显示一些加载状态或模拟结果更新
        });
    }

    if (resetButton) {
         resetButton.addEventListener('click', () => {
            console.log('Filters reset.');
            const filters = document.querySelectorAll('.filter-sidebar select, .filter-sidebar input[type="text"], .filter-sidebar input[type="number"]');
            filters.forEach(input => {
                if (input.tagName === 'SELECT') {
                    input.selectedIndex = 0; // 重置下拉框
                } else {
                    input.value = ''; // 清空输入框
                }
            });
            // 可能需要关闭所有 details
             document.querySelectorAll('.filter-group').forEach(details => details.removeAttribute('open'));
             // 默认打开第一个
             const firstDetails = document.querySelector('.filter-group');
             if (firstDetails) {
                 firstDetails.setAttribute('open', '');
             }

        });
    }

     if (applyButton) {
        applyButton.addEventListener('click', () => {
            console.log('Applying filters...');
             // 在这里收集筛选条件并调用后端 API
        });
    }

    detailButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log('View details clicked.');
            // 在这里可以实现跳转到详情页或打开模态框显示详细信息
            alert('跳转到详情页面（原型功能）');
        });
    });

});