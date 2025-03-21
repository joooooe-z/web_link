// subscription-core.js
const SubscriptionCore = {
  // 命名空间
  namespace: 'onerway.subscription',
  
  /**
   * 初始化订阅核心模块
   */
  init() {
    // 初始化存储
    this.initStorage();
    console.log('SubscriptionCore initialized');
  },
  
  /**
   * 初始化存储
   */
  initStorage() {
    const subscriptionLinks = localStorage.getItem(`${this.namespace}.links`);
    if (!subscriptionLinks) {
      localStorage.setItem(`${this.namespace}.links`, JSON.stringify([]));
    }
    
    const subscriptionInstances = localStorage.getItem(`${this.namespace}.instances`);
    if (!subscriptionInstances) {
      localStorage.setItem(`${this.namespace}.instances`, JSON.stringify([]));
    }
    
    const subscriptionTransactions = localStorage.getItem(`${this.namespace}.transactions`);
    if (!subscriptionTransactions) {
      localStorage.setItem(`${this.namespace}.transactions`, JSON.stringify([]));
    }
  },
  
  /**
   * 生成短ID
   * @returns {String} 短ID
   */
  generateShortId() {
    return Math.random().toString(36).substring(2, 10);
  },
  
  /**
   * 获取所有订阅链接
   * @returns {Array} 订阅链接数组
   */
  getAllSubscriptionLinks() {
    return JSON.parse(localStorage.getItem(`${this.namespace}.links`) || '[]');
  },
  
  /**
   * 保存订阅链接列表
   * @param {Array} links - 订阅链接数组
   */
  saveSubscriptionLinks(links) {
    localStorage.setItem(`${this.namespace}.links`, JSON.stringify(links));
  },
  
  /**
   * 获取订阅链接
   * @param {String} id - 链接ID
   * @returns {Object} 订阅链接对象
   */
  getSubscriptionLink(id) {
    const links = this.getAllSubscriptionLinks();
    return links.find(link => link.id === id);
  },
  
  /**
   * 获取订阅链接（通过短ID）
   * @param {String} shortId - 短链接ID
   * @returns {Object} 订阅链接对象
   */
  getSubscriptionLinkByShortId(shortId) {
    const links = this.getAllSubscriptionLinks();
    return links.find(link => link.shortId === shortId);
  },
  
  /**
   * 创建订阅链接
   * @param {Object} linkData - 订阅链接数据
   * @returns {Object} 创建的订阅链接
   */
  createSubscriptionLink(linkData) {
    const links = this.getAllSubscriptionLinks();
    
    // 生成唯一ID
    const linkId = `sub_link_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // 创建链接对象
    const link = {
      id: linkId,
      shortId: this.generateShortId(),
      merchantId: 'demo_merchant',
      title: linkData.title,
      description: linkData.description || '',
      imageUrl: linkData.imageUrl || null,
      amount: linkData.amount,
      currency: linkData.currency,
      billingFrequency: linkData.billingFrequency || 'monthly',
      totalBillingCycles: linkData.totalBillingCycles || 'unlimited',
      trialDays: linkData.trialDays || 0,
      paymentMethod: linkData.paymentMethod || 'automatic',
      addressCollection: linkData.addressCollection || 'none',
      requirePhone: linkData.requirePhone || false,
      status: 'active',
      createdAt: new Date().toISOString(),
      disabledAt: null,
      stats: {
        visits: 0,
        subscriptions: 0,
        totalAmount: 0
      }
    };
    
    links.push(link);
    this.saveSubscriptionLinks(links);
    
    return link;
  },
  
  /**
   * 更新订阅链接
   * @param {Object} updatedLink - 更新的链接对象
   * @returns {Boolean} 更新是否成功
   */
  updateSubscriptionLink(updatedLink) {
    const links = this.getAllSubscriptionLinks();
    const index = links.findIndex(link => link.id === updatedLink.id);
    
    if (index >= 0) {
      links[index] = updatedLink;
      this.saveSubscriptionLinks(links);
      return true;
    }
    
    return false;
  },
  
  /**
   * 删除订阅链接
   * @param {String} id - 链接ID
   * @returns {Boolean} 删除是否成功
   */
  deleteSubscriptionLink(id) {
    const links = this.getAllSubscriptionLinks();
    const newLinks = links.filter(link => link.id !== id);
    
    if (newLinks.length < links.length) {
      this.saveSubscriptionLinks(newLinks);
      return true;
    }
    
    return false;
  },
  
  /**
   * 获取所有订阅实例
   * @returns {Array} 订阅实例数组
   */
  getAllSubscriptionInstances() {
    return JSON.parse(localStorage.getItem(`${this.namespace}.instances`) || '[]');
  },
  
  /**
   * 保存订阅实例列表
   * @param {Array} instances - 订阅实例数组
   */
  saveSubscriptionInstances(instances) {
    localStorage.setItem(`${this.namespace}.instances`, JSON.stringify(instances));
  },
  
  /**
   * 获取订阅实例
   * @param {String} id - 实例ID
   * @returns {Object} 订阅实例对象
   */
  getSubscriptionInstance(id) {
    const instances = this.getAllSubscriptionInstances();
    return instances.find(instance => instance.id === id);
  },
  
  /**
   * 获取链接的所有订阅实例
   * @param {String} linkId - 链接ID
   * @returns {Array} 订阅实例数组
   */
  getSubscriptionInstancesByLinkId(linkId) {
    const instances = this.getAllSubscriptionInstances();
    return instances.filter(instance => instance.subscriptionLinkId === linkId);
  },
  
  /**
   * 创建订阅实例
   * @param {String} linkId - 订阅链接ID
   * @param {Object} customerData - 客户数据
   * @returns {Object} 创建的订阅实例
   */
  createSubscriptionInstance(linkId, customerData) {
    const link = this.getSubscriptionLink(linkId);
    if (!link) {
      throw new Error('订阅链接不存在');
    }
    
    const instances = this.getAllSubscriptionInstances();
    
    // 计算订阅周期
    const startDate = new Date();
    let endDate;
    
    if (link.totalBillingCycles === 'unlimited') {
      // 无限订阅，设置一个远期结束日期
      endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 10);
    } else {
      endDate = new Date(startDate);
      switch (link.billingFrequency) {
        case 'daily':
          endDate.setDate(endDate.getDate() + parseInt(link.totalBillingCycles));
          break;
        case 'weekly':
          endDate.setDate(endDate.getDate() + parseInt(link.totalBillingCycles) * 7);
          break;
        case 'monthly':
          endDate.setMonth(endDate.getMonth() + parseInt(link.totalBillingCycles));
          break;
      }
    }
    
    // 计算试用期结束日期
    let trialEndsAt = null;
    if (link.trialDays > 0) {
      trialEndsAt = new Date(startDate);
      trialEndsAt.setDate(trialEndsAt.getDate() + parseInt(link.trialDays));
    }
    
    // 计算下次扣款日期
    const nextBillingDate = trialEndsAt || new Date(startDate);
    switch (link.billingFrequency) {
      case 'daily':
        nextBillingDate.setDate(nextBillingDate.getDate() + 1);
        break;
      case 'weekly':
        nextBillingDate.setDate(nextBillingDate.getDate() + 7);
        break;
      case 'monthly':
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
        break;
    }
    
    // 创建实例对象
    const instance = {
      id: `sub_inst_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      subscriptionLinkId: linkId,
      customerId: customerData.customerId || `cus_${Math.random().toString(36).substring(2, 9)}`,
      customerEmail: customerData.email,
      status: trialEndsAt ? 'trialing' : 'active',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      trialEndsAt: trialEndsAt ? trialEndsAt.toISOString() : null,
      nextBillingDate: nextBillingDate.toISOString(),
      nextBillingAmount: link.amount,
      productName: link.title,
      productQuantity: 1,
      productUnitPrice: link.amount,
      totalAmount: link.amount,
      currency: link.currency,
      billingCycles: link.totalBillingCycles === 'unlimited' ? 0 : parseInt(link.totalBillingCycles),
      currentCycle: 1,
      billingFrequency: link.billingFrequency,
      paymentMethod: customerData.paymentMethod || 'card',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    instances.push(instance);
    this.saveSubscriptionInstances(instances);
    
    // 更新链接统计信息
    const subscriptions = link.stats.subscriptions + 1;
    link.stats.subscriptions = subscriptions;
    this.updateSubscriptionLink(link);
    
    return instance;
  },
  
  /**
   * 获取所有订阅交易
   * @returns {Array} 订阅交易数组
   */
  getAllSubscriptionTransactions() {
    return JSON.parse(localStorage.getItem(`${this.namespace}.transactions`) || '[]');
  },
  
  /**
   * 保存订阅交易列表
   * @param {Array} transactions - 订阅交易数组
   */
  saveSubscriptionTransactions(transactions) {
    localStorage.setItem(`${this.namespace}.transactions`, JSON.stringify(transactions));
  },
  
  /**
   * 获取实例的所有交易
   * @param {String} instanceId - 实例ID
   * @returns {Array} 交易数组
   */
  getTransactionsByInstanceId(instanceId) {
    const transactions = this.getAllSubscriptionTransactions();
    return transactions.filter(t => t.subscriptionInstanceId === instanceId);
  },
  
  /**
   * 记录订阅交易
   * @param {String} instanceId - 订阅实例ID
   * @param {Number} amount - 交易金额
   * @param {String} status - 交易状态
   * @returns {Object} 创建的交易
   */
  recordSubscriptionTransaction(instanceId, amount, status = 'succeeded') {
    const instance = this.getSubscriptionInstance(instanceId);
    if (!instance) {
      throw new Error('订阅实例不存在');
    }
    
    const transactions = this.getAllSubscriptionTransactions();
    
    const transaction = {
      id: `sub_txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      subscriptionInstanceId: instanceId,
      amount: amount,
      currency: instance.currency,
      status: status,
      paymentMethod: instance.paymentMethod,
      transactionDate: new Date().toISOString(),
      billingCycle: instance.currentCycle
    };
    
    transactions.push(transaction);
    this.saveSubscriptionTransactions(transactions);
    
    // 更新实例信息
    if (status === 'succeeded') {
      instance.currentCycle++;
      instance.updatedAt = new Date().toISOString();
      
      // 计算下次扣款日期
      const nextBillingDate = new Date(instance.nextBillingDate);
      switch (instance.billingFrequency) {
        case 'daily':
          nextBillingDate.setDate(nextBillingDate.getDate() + 1);
          break;
        case 'weekly':
          nextBillingDate.setDate(nextBillingDate.getDate() + 7);
          break;
        case 'monthly':
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
          break;
      }
      instance.nextBillingDate = nextBillingDate.toISOString();
      
      // 检查是否是最后一期
      if (instance.billingCycles > 0 && instance.currentCycle > instance.billingCycles) {
        instance.status = 'completed';
      }
      
      // 更新实例
      const instances = this.getAllSubscriptionInstances();
      const index = instances.findIndex(inst => inst.id === instance.id);
      if (index >= 0) {
        instances[index] = instance;
        this.saveSubscriptionInstances(instances);
      }
      
      // 更新链接统计
      const link = this.getSubscriptionLink(instance.subscriptionLinkId);
      if (link) {
        link.stats.totalAmount += parseFloat(amount);
        this.updateSubscriptionLink(link);
      }
    }
    
    return transaction;
  },
  
  /**
   * 记录链接访问
   * @param {String} id - 链接ID
   * @returns {Boolean} 记录是否成功
   */
  recordSubscriptionLinkVisit(id) {
    const link = this.getSubscriptionLink(id);
    if (link) {
      link.stats.visits++;
      this.updateSubscriptionLink(link);
      return true;
    }
    return false;
  },
  
  /**
   * 取消订阅
   * @param {String} instanceId - 订阅实例ID
   * @returns {Boolean} 取消是否成功
   */
  cancelSubscription(instanceId) {
    const instance = this.getSubscriptionInstance(instanceId);
    if (!instance) {
      return false;
    }
    
    instance.status = 'cancelled';
    instance.updatedAt = new Date().toISOString();
    
    const instances = this.getAllSubscriptionInstances();
    const index = instances.findIndex(inst => inst.id === instanceId);
    if (index >= 0) {
      instances[index] = instance;
      this.saveSubscriptionInstances(instances);
      return true;
    }
    
    return false;
  }
}; 