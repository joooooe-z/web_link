// module-loader.js
const ModuleLoader = {
  /**
   * 加载订阅模块
   * @param {String} containerId - UI容器的DOM ID
   * @param {Object} options - 配置选项
   */
  loadSubscriptionModule(containerId, options = {}) {
    // 加载核心模块
    this.loadScript('/js/modules/subscription-core.js', () => {
      // 加载UI模块
      this.loadScript('/js/modules/subscription-ui.js', () => {
        // 加载事件模块
        this.loadScript('/js/modules/subscription-events.js', () => {
          // 初始化订阅模块
          if (window.SubscriptionCore && window.SubscriptionUI && window.SubscriptionEvents) {
            SubscriptionCore.init();
            SubscriptionUI.init(containerId);
            SubscriptionEvents.init();
            
            // 触发模块加载完成事件
            this.dispatchModuleLoadedEvent();
          }
        });
      });
    });
  },
  
  /**
   * 动态加载脚本
   * @param {String} src - 脚本源路径
   * @param {Function} callback - 加载完成回调
   */
  loadScript(src, callback) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    script.onload = callback;
    document.head.appendChild(script);
  },
  
  /**
   * 分发模块加载完成事件
   */
  dispatchModuleLoadedEvent() {
    const event = new CustomEvent('subscription-module-loaded');
    document.dispatchEvent(event);
  }
}; 