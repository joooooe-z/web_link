const SubscriptionUI = {
  container: null,
  
  /**
   * 初始化UI模块
   * @param {String} containerId - 容器ID
   */
  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error('容器元素不存在:', containerId);
      return;
    }
    
    // 监听hash变化
    window.addEventListener('hashchange', this.handleRouteChange.bind(this));
    
    // 触发初始路由
    this.handleRouteChange();
    
    console.log('SubscriptionUI initialized');
  },
  
  /**
   * 处理路由变化
   */
  handleRouteChange() {
    const hash = window.location.hash || '#list';
    const route = hash.split('/');
    
    switch(route[0]) {
      case '#create':
        this.renderCreateForm();
        break;
      case '#details':
        this.renderLinkDetails(route[1]);
        break;
      case '#instance':
        this.renderInstanceDetails(route[1]);
        break;
      case '#list':
      default:
        this.renderLinksList();
        break;
    }
  },
  
  /**
   * 渲染订阅链接列表
   */
  renderLinksList() {
    const links = SubscriptionCore.getAllSubscriptionLinks();
    
    this.container.innerHTML = `
      <div class="subscription-module">
        <div class="module-header">
          <h2>订阅链接</h2>
          <a href="#create" class="pure-button primary-button">创建订阅链接</a>
        </div>
        
        <div class="card">
          <div class="card-body">
            <table class="pure-table pure-table-bordered">
              <thead>
                <tr>
                  <th>商品名</th>
                  <th>金额</th>
                  <th>扣款频率</th>
                  <th>创建时间</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                ${links.length === 0 
                  ? '<tr><td colspan="6" class="text-center">暂无订阅链接</td></tr>'
                  : links.map(link => this.renderLinkRow(link)).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },
  
  /**
   * 渲染链接行
   * @param {Object} link - 链接对象
   * @returns {String} HTML字符串
   */
  renderLinkRow(link) {
    let statusText, statusClass;
    
    if (link.status === 'active') {
      statusText = '启用';
      statusClass = 'badge-success';
    } else {
      statusText = '停用';
      statusClass = 'badge-secondary';
    }
    
    let frequencyText;
    switch(link.billingFrequency) {
      case 'daily': frequencyText = '每天'; break;
      case 'weekly': frequencyText = '每周'; break;
      case 'monthly': frequencyText = '每月'; break;
      default: frequencyText = link.billingFrequency;
    }
    
    return `
      <tr>
        <td>${link.title}</td>
        <td>${this.formatAmount(link.amount, link.currency)}</td>
        <td>${frequencyText}</td>
        <td>${this.formatDate(link.createdAt)}</td>
        <td><span class="badge ${statusClass}">${statusText}</span></td>
        <td>
          <a href="#details/${link.id}" class="pure-button secondary-button">查看详情</a>
        </td>
      </tr>
    `;
  },
  
  /**
   * 渲染创建表单
   */
  renderCreateForm() {
    this.container.innerHTML = `
      <div class="subscription-module">
        <div class="module-header">
          <h2>创建订阅链接</h2>
          <a href="#list" class="pure-button secondary-button">返回列表</a>
        </div>
        
        <form id="create-subscription-form" class="pure-form pure-form-stacked">
          <!-- 商品信息 -->
          <fieldset>
            <legend>商品信息</legend>
            
            <div class="form-group">
              <label for="title">商品名称 *</label>
              <input type="text" id="title" class="form-control" required maxlength="50">
            </div>
            
            <div class="pure-g">
              <div class="pure-u-1-2">
                <div class="form-group">
                  <label for="amount">价格 *</label>
                  <input type="number" id="amount" class="form-control" step="0.01" min="0.01" required>
                </div>
              </div>
              <div class="pure-u-1-2">
                <div class="form-group">
                  <label for="currency">币种 *</label>
                  <select id="currency" class="form-control" required>
                    <option value="USD">美元 (USD)</option>
                    <option value="EUR">欧元 (EUR)</option>
                    <option value="JPY">日元 (JPY)</option>
                    <option value="CNY">人民币 (CNY)</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label for="description">商品描述</label>
              <textarea id="description" class="form-control" rows="3" maxlength="200"></textarea>
            </div>
            
            <div class="form-group">
              <label for="image">商品图片</label>
              <input type="file" id="image" class="form-control" accept="image/*">
            </div>
          </fieldset>
          
          <!-- 订阅选项 -->
          <fieldset>
            <legend>订阅选项</legend>
            
            <div class="form-group">
              <label for="billingFrequency">订阅周期 *</label>
              <select id="billingFrequency" class="form-control" required>
                <option value="daily">1天</option>
                <option value="weekly">7天</option>
                <option value="monthly" selected>30天</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="totalBillingCycles">期数选择 *</label>
              <select id="totalBillingCycles" class="form-control" required>
                <option value="1">1期</option>
                <option value="3">3期</option>
                <option value="6">6期</option>
                <option value="12">12期</option>
                <option value="unlimited">永远</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="trialDays">试用天数</label>
              <input type="number" id="trialDays" class="form-control" min="0" max="90" value="0">
              <small>0表示无试用期，最长90天</small>
            </div>
          </fieldset>
          
          <!-- 账单选项 -->
          <fieldset>
            <legend>账单选项</legend>
            
            <div class="form-group">
              <label class="pure-checkbox">
                <input type="checkbox" id="collectAddress"> 
                收集客户地址
              </label>
              
              <div id="addressTypeOptions" style="display: none; margin-top: 10px;">
                <label class="pure-radio">
                  <input type="radio" name="addressType" value="billing" checked> 
                  仅账单地址
                </label>
                <br>
                <label class="pure-radio">
                  <input type="radio" name="addressType" value="billing_and_shipping"> 
                  账单地址和配送地址
                </label>
              </div>
            </div>
            
            <div class="form-group">
              <label class="pure-checkbox">
                <input type="checkbox" id="requirePhone"> 
                要求用户提供手机号
              </label>
            </div>
            
            <div class="form-group">
              <label>付款方式</label>
              <div>
                <label class="pure-checkbox">
                  <input type="checkbox" id="cardPayment" checked> 
                  填写卡信息自动扣款
                </label>
                <br>
                <label class="pure-checkbox">
                  <input type="checkbox" id="googlePay"> 
                  Google Pay 自动扣款
                </label>
                <br>
                <label class="pure-checkbox">
                  <input type="checkbox" id="applePay"> 
                  Apple Pay 自动扣款
                </label>
              </div>
            </div>
          </fieldset>
          
          <!-- 提交按钮 -->
          <div class="form-actions">
            <button type="submit" class="pure-button primary-button">创建订阅链接</button>
            <a href="#list" class="pure-button secondary-button">取消</a>
          </div>
        </form>
      </div>
    `;
    
    // 绑定事件
    document.getElementById('collectAddress').addEventListener('change', function() {
      document.getElementById('addressTypeOptions').style.display = this.checked ? 'block' : 'none';
    });
    
    document.getElementById('create-subscription-form').addEventListener('submit', this.handleFormSubmit.bind(this));
  },
  
  /**
   * 处理表单提交
   * @param {Event} e - 表单提交事件
   */
  handleFormSubmit(e) {
    e.preventDefault();
    
    // 收集表单数据
    const formData = {
      title: document.getElementById('title').value,
      description: document.getElementById('description').value,
      amount: parseFloat(document.getElementById('amount').value),
      currency: document.getElementById('currency').value,
      billingFrequency: document.getElementById('billingFrequency').value,
      totalBillingCycles: document.getElementById('totalBillingCycles').value,
      trialDays: parseInt(document.getElementById('trialDays').value) || 0,
      requirePhone: document.getElementById('requirePhone').checked,
      addressCollection: document.getElementById('collectAddress').checked
        ? document.querySelector('input[name="addressType"]:checked').value
        : 'none',
      paymentMethods: []
    };
    
    // 收集支付方式
    if (document.getElementById('cardPayment').checked) formData.paymentMethods.push('card');
    if (document.getElementById('googlePay').checked) formData.paymentMethods.push('google_pay');
    if (document.getElementById('applePay').checked) formData.paymentMethods.push('apple_pay');
    
    // 处理图片上传
    const imageFile = document.getElementById('image').files[0];
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        formData.imageUrl = e.target.result;
        this.createSubscriptionLink(formData);
      };
      reader.readAsDataURL(imageFile);
    } else {
      this.createSubscriptionLink(formData);
    }
  },
  
  /**
   * 创建订阅链接
   * @param {Object} formData - 表单数据
   */
  createSubscriptionLink(formData) {
    try {
      const link = SubscriptionCore.createSubscriptionLink(formData);
      alert('订阅链接创建成功！');
      window.location.hash = `#details/${link.id}`;
    } catch (error) {
      console.error('创建订阅链接失败:', error);
      alert('创建订阅链接失败: ' + error.message);
    }
  },
  
  /**
   * 渲染订阅链接详情
   * @param {String} linkId - 订阅链接ID
   */
  renderLinkDetails(linkId) {
    const link = SubscriptionCore.getSubscriptionLink(linkId);
    if (!link) {
      this.container.innerHTML = `
        <div class="error-message">
          <h3>链接不存在</h3>
          <a href="#list" class="pure-button primary-button">返回列表</a>
        </div>
      `;
      return;
    }
    
    // 获取订阅实例
    const instances = SubscriptionCore.getSubscriptionInstancesByLinkId(linkId);
    
    this.container.innerHTML = `
      <div class="subscription-module">
        <div class="module-header">
          <h2>订阅链接详情</h2>
          <a href="#list" class="pure-button secondary-button">返回列表</a>
        </div>
        
        <div class="pure-g">
          <div class="pure-u-1-2">
            <div class="detail-section">
              <h3>基本信息</h3>
              <table class="pure-table pure-table-bordered">
                <tbody>
                  <tr>
                    <th>商品名</th>
                    <td>${link.title}</td>
                  </tr>
                  <tr>
                    <th>金额</th>
                    <td>${this.formatAmount(link.amount, link.currency)}</td>
                  </tr>
                  <tr>
                    <th>状态</th>
                    <td>
                      <span class="badge ${link.status === 'active' ? 'badge-success' : 'badge-secondary'}">
                        ${link.status === 'active' ? '启用' : '停用'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <th>扣款频率</th>
                    <td>${this.getBillingFrequencyText(link.billingFrequency)}</td>
                  </tr>
                  <tr>
                    <th>扣款方式</th>
                    <td>${link.paymentMethod === 'automatic' ? '自动' : '商家扣款'}</td>
                  </tr>
                  <tr>
                    <th>订阅周期</th>
                    <td>${this.getBillingFrequencyText(link.billingFrequency)}</td>
                  </tr>
                  <tr>
                    <th>期数</th>
                    <td>${link.totalBillingCycles === 'unlimited' ? '无限' : link.totalBillingCycles}</td>
                  </tr>
                  <tr>
                    <th>试用天数</th>
                    <td>${link.trialDays || '无'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div class="pure-u-1-2">
            <div class="detail-section">
              <h3>统计信息</h3>
              <div class="stats-container">
                <div class="stat-item">
                  <div class="stat-value">${instances.length}</div>
                  <div class="stat-label">已订阅用户数</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">${link.stats.visits || 0}</div>
                  <div class="stat-label">访问次数</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">${this.formatAmount(link.stats.totalAmount || 0, link.currency)}</div>
                  <div class="stat-label">已收取金额</div>
                </div>
              </div>
              
              <div class="link-actions">
                <h4>链接操作</h4>
                <div class="link-url" id="subscription-link-url">
                  ${window.location.origin}${window.location.pathname.replace('merchant/dashboard.html', '')}customer/subscribe.html?id=${link.shortId}
                </div>
                <div class="link-actions-buttons">
                  <button id="copy-link-btn" class="pure-button secondary-button">
                    <i class="icon-copy"></i> 复制链接
                  </button>
                  <button id="toggle-status-btn" class="pure-button ${link.status === 'active' ? 'secondary-button' : 'primary-button'}">
                    ${link.status === 'active' ? '停用链接' : '启用链接'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="detail-section">
          <h3>订阅实例</h3>
          <table class="pure-table pure-table-bordered">
            <thead>
              <tr>
                <th>订阅合同号</th>
                <th>开始日期</th>
                <th>到期日期</th>
                <th>用户邮箱</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              ${instances.length === 0 
                ? '<tr><td colspan="6" class="text-center">暂无订阅记录</td></tr>'
                : instances.map(instance => this.renderInstanceRow(instance)).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
    
    // 绑定事件
    document.getElementById('copy-link-btn').addEventListener('click', () => {
      const linkUrl = document.getElementById('subscription-link-url').textContent.trim();
      navigator.clipboard.writeText(linkUrl).then(() => {
        alert('链接已复制到剪贴板');
      }).catch(err => {
        console.error('无法复制链接:', err);
        alert('无法复制链接，请手动选择并复制');
      });
    });
    
    document.getElementById('toggle-status-btn').addEventListener('click', () => {
      const newStatus = link.status === 'active' ? 'disabled' : 'active';
      link.status = newStatus;
      link.disabledAt = newStatus === 'disabled' ? new Date().toISOString() : null;
      
      if (SubscriptionCore.updateSubscriptionLink(link)) {
        alert(`链接已${newStatus === 'active' ? '启用' : '停用'}`);
        this.renderLinkDetails(linkId);
      } else {
        alert('操作失败，请重试');
      }
    });
  },
  
  /**
   * 渲染订阅实例行
   * @param {Object} instance - 订阅实例对象
   * @returns {String} HTML字符串
   */
  renderInstanceRow(instance) {
    let statusText, statusClass;
    
    switch(instance.status) {
      case 'active':
        statusText = '生效中';
        statusClass = 'badge-success';
        break;
      case 'trialing':
        statusText = '试用中';
        statusClass = 'badge-info';
        break;
      case 'pending_payment':
        statusText = '待扣款';
        statusClass = 'badge-warning';
        break;
      case 'cancelled':
        statusText = '已取消';
        statusClass = 'badge-secondary';
        break;
      case 'completed':
        statusText = '已完成';
        statusClass = 'badge-primary';
        break;
      default:
        statusText = instance.status;
        statusClass = 'badge-secondary';
    }
    
    return `
      <tr>
        <td>${instance.id}</td>
        <td>${this.formatDate(instance.startDate)}</td>
        <td>${this.formatDate(instance.endDate)}</td>
        <td>${instance.customerEmail}</td>
        <td><span class="badge ${statusClass}">${statusText}</span></td>
        <td>
          <a href="#instance/${instance.id}" class="pure-button secondary-button">查看详情</a>
        </td>
      </tr>
    `;
  },
  
  /**
   * 渲染订阅实例详情
   * @param {String} instanceId - 订阅实例ID
   */
  renderInstanceDetails(instanceId) {
    const instance = SubscriptionCore.getSubscriptionInstance(instanceId);
    if (!instance) {
      this.container.innerHTML = `
        <div class="error-message">
          <h3>订阅不存在</h3>
          <a href="#list" class="pure-button primary-button">返回列表</a>
        </div>
      `;
      return;
    }
    
    // 获取关联的链接
    const link = SubscriptionCore.getSubscriptionLink(instance.subscriptionLinkId);
    
    // 获取交易记录
    const transactions = SubscriptionCore.getTransactionsByInstanceId(instanceId);
    
    this.container.innerHTML = `
      <div class="subscription-module">
        <div class="module-header">
          <h2>订阅详情</h2>
          <div>
            <a href="#details/${instance.subscriptionLinkId}" class="pure-button secondary-button">返回订阅链接</a>
            <a href="#list" class="pure-button secondary-button">返回列表</a>
          </div>
        </div>
        
        <div class="pure-g">
          <div class="pure-u-1-2">
            <div class="detail-section">
              <h3>订阅基础信息</h3>
              <table class="pure-table pure-table-bordered">
                <tbody>
                  <tr>
                    <th>订阅状态</th>
                    <td>
                      <span class="badge ${this.getStatusClass(instance.status)}">
                        ${this.getStatusText(instance.status)}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <th>订阅编号</th>
                    <td>${instance.id}</td>
                  </tr>
                  <tr>
                    <th>下次扣款时间</th>
                    <td>${this.formatDate(instance.nextBillingDate)}</td>
                  </tr>
                  <tr>
                    <th>下次扣款金额</th>
                    <td>${this.formatAmount(instance.nextBillingAmount, instance.currency)}</td>
                  </tr>
                  <tr>
                    <th>时效</th>
                    <td>${this.formatDate(instance.startDate)} 至 ${this.formatDate(instance.endDate)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div class="pure-u-1-2">
            <div class="detail-section">
              <h3>顾客信息</h3>
              <table class="pure-table pure-table-bordered">
                <tbody>
                  <tr>
                    <th>客户ID</th>
                    <td>${instance.customerId}</td>
                  </tr>
                  <tr>
                    <th>用户邮箱</th>
                    <td>${instance.customerEmail}</td>
                  </tr>
                  <tr>
                    <th>支付方式</th>
                    <td>${this.getPaymentMethodText(instance.paymentMethod)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div class="detail-section">
          <h3>订阅详情</h3>
          <table class="pure-table pure-table-bordered">
            <tbody>
              <tr>
                <th>扣款方式</th>
                <td>${instance.paymentMethod === 'automatic' ? '自动' : '商家扣款'}</td>
              </tr>
              ${instance.trialEndsAt ? `
              <tr>
                <th>试用结束于</th>
                <td>${this.formatDate(instance.trialEndsAt)}</td>
              </tr>
              ` : ''}
              <tr>
                <th>产品名称</th>
                <td>${instance.productName}</td>
              </tr>
              <tr>
                <th>开始日期</th>
                <td>${this.formatDate(instance.startDate)}</td>
              </tr>
              <tr>
                <th>产品单价</th>
                <td>${this.formatAmount(instance.productUnitPrice, instance.currency)}</td>
              </tr>
              <tr>
                <th>到期日期</th>
                <td>${this.formatDate(instance.endDate)}</td>
              </tr>
              <tr>
                <th>产品数量</th>
                <td>${instance.productQuantity}</td>
              </tr>
              <tr>
                <th>扣款期数</th>
                <td>${instance.billingCycles === 0 ? '无限' : instance.billingCycles}</td>
              </tr>
              <tr>
                <th>扣款金额</th>
                <td>${this.formatAmount(instance.totalAmount, instance.currency)}</td>
              </tr>
              <tr>
                <th>扣款频率</th>
                <td>${this.getBillingFrequencyText(instance.billingFrequency)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="detail-section">
          <div class="header-actions">
            <h3>扣款历史</h3>
            ${instance.status === 'active' || instance.status === 'trialing' ? `
            <button id="record-payment-btn" class="pure-button primary-button">
              <i class="icon-plus"></i> 记录扣款
            </button>
            ` : ''}
          </div>
          <table class="pure-table pure-table-bordered">
            <thead>
              <tr>
                <th>交易流水号</th>
                <th>扣款时间</th>
                <th>金额</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.length === 0 
                ? '<tr><td colspan="4" class="text-center">暂无扣款记录</td></tr>'
                : transactions.map(transaction => this.renderTransactionRow(transaction)).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="detail-section">
          <div class="actions-container">
            ${instance.status === 'active' || instance.status === 'trialing' ? `
            <button id="cancel-subscription-btn" class="pure-button secondary-button">
              <i class="icon-cancel"></i> 取消订阅
            </button>
            ` : ''}
            <button id="delete-btn" class="pure-button danger-button">
              <i class="icon-trash"></i> 删除订阅
            </button>
          </div>
        </div>
      </div>
    `;
    
    // 绑定事件
    const cancelBtn = document.getElementById('cancel-subscription-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        if (confirm('确定要取消此订阅吗？此操作无法撤销。')) {
          if (SubscriptionCore.cancelSubscription(instanceId)) {
            alert('订阅已成功取消');
            this.renderInstanceDetails(instanceId);
          } else {
            alert('取消订阅失败，请重试');
          }
        }
      });
    }
    
    const recordPaymentBtn = document.getElementById('record-payment-btn');
    if (recordPaymentBtn) {
      recordPaymentBtn.addEventListener('click', () => {
        const amount = instance.nextBillingAmount;
        if (confirm(`确定要记录一笔 ${this.formatAmount(amount, instance.currency)} 的扣款吗？`)) {
          try {
            SubscriptionCore.recordSubscriptionTransaction(instanceId, amount);
            alert('扣款记录已添加');
            this.renderInstanceDetails(instanceId);
          } catch (error) {
            console.error('记录扣款失败:', error);
            alert('记录扣款失败: ' + error.message);
          }
        }
      });
    }
  },
  
  /**
   * 渲染交易行
   * @param {Object} transaction - 交易对象
   * @returns {String} HTML字符串
   */
  renderTransactionRow(transaction) {
    let statusText, statusClass;
    
    switch(transaction.status) {
      case 'succeeded':
        statusText = '成功';
        statusClass = 'badge-success';
        break;
      case 'failed':
        statusText = '失败';
        statusClass = 'badge-danger';
        break;
      case 'pending':
        statusText = '处理中';
        statusClass = 'badge-warning';
        break;
      default:
        statusText = transaction.status;
        statusClass = 'badge-secondary';
    }
    
    return `
      <tr>
        <td>${transaction.id}</td>
        <td>${this.formatDate(transaction.transactionDate)}</td>
        <td>${this.formatAmount(transaction.amount, transaction.currency)}</td>
        <td><span class="badge ${statusClass}">${statusText}</span></td>
      </tr>
    `;
  },
  
  /**
   * 获取订阅状态文本
   * @param {String} status - 状态代码
   * @returns {String} 状态文本
   */
  getStatusText(status) {
    switch(status) {
      case 'active': return '生效中';
      case 'trialing': return '试用中';
      case 'pending_payment': return '待扣款';
      case 'cancelled': return '已取消';
      case 'completed': return '已完成';
      default: return status;
    }
  },
  
  /**
   * 获取订阅状态类
   * @param {String} status - 状态代码
   * @returns {String} 状态类
   */
  getStatusClass(status) {
    switch(status) {
      case 'active': return 'badge-success';
      case 'trialing': return 'badge-info';
      case 'pending_payment': return 'badge-warning';
      case 'cancelled': return 'badge-secondary';
      case 'completed': return 'badge-primary';
      default: return 'badge-secondary';
    }
  },
  
  /**
   * 获取支付方式文本
   * @param {String} method - 支付方式代码
   * @returns {String} 支付方式文本
   */
  getPaymentMethodText(method) {
    switch(method) {
      case 'card': return '信用卡支付';
      case 'google_pay': return 'Google Pay';
      case 'apple_pay': return 'Apple Pay';
      default: return method;
    }
  },
  
  /**
   * 获取扣款周期文本
   * @param {String} frequency - 扣款周期
   * @returns {String} 扣款周期文本
   */
  getBillingFrequencyText(frequency) {
    switch(frequency) {
      case 'daily': return '每天';
      case 'weekly': return '每周';
      case 'monthly': return '每月';
      default: return frequency;
    }
  },
  
  /**
   * 格式化日期
   * @param {String} dateString - ISO日期字符串
   * @returns {String} 格式化后的日期
   */
  formatDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('zh-CN');
  },
  
  /**
   * 格式化金额
   * @param {Number} amount - 金额
   * @param {String} currency - 货币代码
   * @returns {String} 格式化后的金额
   */
  formatAmount(amount, currency) {
    return new Intl.NumberFormat('zh-CN', { 
      style: 'currency', 
      currency: currency 
    }).format(amount);
  }
}; 