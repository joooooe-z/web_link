// subscription-events.js
const SubscriptionEvents = {
  /**
   * 初始化事件模块
   */
  init() {
    // 使用事件委托处理所有点击事件
    document.addEventListener('click', this.handleDocumentClick.bind(this));
    
    console.log('SubscriptionEvents initialized');
  },
  
  /**
   * 处理文档点击事件
   * @param {Event} event - 点击事件
   */
  handleDocumentClick(event) {
    // 复制链接按钮
    if (event.target.matches('#copy-link-btn') || event.target.closest('#copy-link-btn')) {
      const linkUrl = document.getElementById('subscription-link-url');
      if (linkUrl) {
        navigator.clipboard.writeText(linkUrl.textContent.trim()).then(() => {
          alert('链接已复制到剪贴板');
        }).catch(err => {
          console.error('无法复制链接:', err);
          alert('无法复制链接，请手动选择并复制');
        });
      }
    }
    
    // 取消订阅按钮
    if (event.target.matches('#cancel-subscription-btn') || event.target.closest('#cancel-subscription-btn')) {
      // 获取实例ID
      const hash = window.location.hash;
      const instanceId = hash.split('/')[1];
      
      if (instanceId && confirm('确定要取消此订阅吗？此操作无法撤销。')) {
        if (SubscriptionCore.cancelSubscription(instanceId)) {
          alert('订阅已成功取消');
          // 重新加载页面
          window.location.reload();
        } else {
          alert('取消订阅失败，请重试');
        }
      }
    }
    
    // 记录扣款按钮
    if (event.target.matches('#record-payment-btn') || event.target.closest('#record-payment-btn')) {
      // 获取实例ID
      const hash = window.location.hash;
      const instanceId = hash.split('/')[1];
      
      if (instanceId) {
        const instance = SubscriptionCore.getSubscriptionInstance(instanceId);
        if (instance) {
          const amount = instance.nextBillingAmount;
          if (confirm(`确定要记录一笔 ${new Intl.NumberFormat('zh-CN', { style: 'currency', currency: instance.currency }).format(amount)} 的扣款吗？`)) {
            try {
              SubscriptionCore.recordSubscriptionTransaction(instanceId, amount);
              alert('扣款记录已添加');
              // 重新加载页面
              window.location.reload();
            } catch (error) {
              console.error('记录扣款失败:', error);
              alert('记录扣款失败: ' + error.message);
            }
          }
        }
      }
    }
  }
}; 