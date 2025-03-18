document.addEventListener('DOMContentLoaded', function() {
    // 复制链接ID功能
    const copyIcons = document.querySelectorAll('.copy-icon');
    copyIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const linkId = this.previousElementSibling.textContent;
            navigator.clipboard.writeText(linkId)
                .then(() => {
                    // 显示复制成功提示
                    const tooltip = document.createElement('div');
                    tooltip.className = 'tooltip';
                    tooltip.textContent = '已复制!';
                    document.body.appendChild(tooltip);
                    
                    // 定位提示框
                    const rect = this.getBoundingClientRect();
                    tooltip.style.top = `${rect.top - 30}px`;
                    tooltip.style.left = `${rect.left}px`;
                    
                    // 2秒后移除提示
                    setTimeout(() => {
                        document.body.removeChild(tooltip);
                    }, 2000);
                })
                .catch(err => {
                    console.error('复制失败:', err);
                });
        });
    });

    // 创建链接按钮点击事件
    const createLinkBtn = document.querySelector('.card-header .btn-primary');
    if (createLinkBtn) {
        createLinkBtn.addEventListener('click', function() {
            // 跳转到创建链接页面
            window.location.href = 'create-link.html';
        });
    }

    // 查询按钮点击事件
    const queryBtn = document.querySelector('.filter-actions .btn-primary');
    if (queryBtn) {
        queryBtn.addEventListener('click', function() {
            console.log('执行查询');
            // 这里可以添加查询逻辑
        });
    }

    // 重置按钮点击事件
    const resetBtn = document.querySelector('.filter-actions .btn-default');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            // 重置所有筛选条件
            document.querySelectorAll('.filter-section input').forEach(input => {
                input.value = '';
            });
            document.querySelectorAll('.filter-section select').forEach(select => {
                select.selectedIndex = 0;
            });
        });
    }

    // 导出按钮点击事件
    const exportBtn = document.querySelector('.filter-actions .btn-outline');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            console.log('导出数据');
            // 这里可以添加导出逻辑
        });
    }

    // 添加复制成功提示的样式
    const style = document.createElement('style');
    style.textContent = `
        .tooltip {
            position: fixed;
            background-color: #333;
            color: #fff;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
            animation: fadeIn 0.3s, fadeOut 0.3s 1.7s;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}); 