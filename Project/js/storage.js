// 初始化存储
function initStorage() {
    if (!localStorage.getItem('paymentLinks')) {
        localStorage.setItem('paymentLinks', JSON.stringify([]));
    }
    if (!localStorage.getItem('transactions')) {
        localStorage.setItem('transactions', JSON.stringify([]));
    }
}

// 重置所有数据
function resetAllData() {
    localStorage.setItem('paymentLinks', JSON.stringify([]));
    localStorage.setItem('transactions', JSON.stringify([]));
}

// 生成唯一ID
function generateId(prefix) {
    return prefix + '_' + Math.random().toString(36).substr(2, 9);
}

// 获取所有支付链接
function getAllLinks() {
    initStorage();
    return JSON.parse(localStorage.getItem('paymentLinks'));
}

// 获取单个链接
function getLink(id) {
    const links = getAllLinks();
    return links.find(link => link.id === id);
}

// 根据短ID获取链接
function getLinkByShortId(shortId) {
    const links = getAllLinks();
    return links.find(link => link.shortId === shortId);
}

// 保存支付链接
function saveLink(link) {
    const links = getAllLinks();
    const existingIndex = links.findIndex(l => l.id === link.id);
    
    // 检查商品编号唯一性
    if (existingIndex < 0 && links.some(l => l.productCode === link.productCode)) {
        throw new Error('商品编号已存在');
    }
    
    if (existingIndex >= 0) {
        links[existingIndex] = link;
    } else {
        link.id = generateId('pl');
        link.shortId = generateShortId();
        link.createdAt = new Date().toISOString();
        link.status = 'ACTIVE';
        link.stats = { visits: 0, conversions: 0, totalAmount: 0 };
        links.push(link);
    }
    
    localStorage.setItem('paymentLinks', JSON.stringify(links));
    return link;
}

// 生成短ID
function generateShortId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// 更新链接状态
function updateLinkStatus(id, status) {
    const links = getAllLinks();
    const index = links.findIndex(link => link.id === id);
    
    if (index >= 0) {
        links[index].status = status;
        localStorage.setItem('paymentLinks', JSON.stringify(links));
        return true;
    }
    return false;
}

// 删除链接
function deleteLink(id) {
    const links = getAllLinks();
    const newLinks = links.filter(link => link.id !== id);
    
    if (newLinks.length !== links.length) {
        localStorage.setItem('paymentLinks', JSON.stringify(newLinks));
        return true;
    }
    return false;
}

// 更新链接统计
function updateLinkStats(id, statsUpdate) {
    const links = getAllLinks();
    const index = links.findIndex(link => link.id === id);
    
    if (index >= 0) {
        links[index].stats = {
            ...links[index].stats,
            ...statsUpdate
        };
        localStorage.setItem('paymentLinks', JSON.stringify(links));
        return true;
    }
    return false;
}

// 记录交易
function recordTransaction(transaction) {
    initStorage();
    const transactions = JSON.parse(localStorage.getItem('transactions'));
    
    transaction.id = generateId('tr');
    transaction.createdAt = new Date().toISOString();
    
    // 添加商品名称
    const link = getLink(transaction.linkId);
    if (link) {
        transaction.productTitle = link.title;
        transaction.productCode = link.productCode;
    }
    
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    // 更新链接统计
    if (link) {
        updateLinkStats(link.id, {
            conversions: link.stats.conversions + 1,
            totalAmount: link.stats.totalAmount + parseFloat(transaction.amount)
        });
    }
    
    return transaction;
}

// 获取所有交易
function getAllTransactions() {
    initStorage();
    return JSON.parse(localStorage.getItem('transactions'));
}

// 获取链接交易记录
function getLinkTransactions(linkId) {
    initStorage();
    const transactions = JSON.parse(localStorage.getItem('transactions'));
    return transactions.filter(t => t.linkId === linkId);
}

// 登记链接访问
function recordLinkVisit(id) {
    const link = getLink(id);
    if (link) {
        updateLinkStats(id, {
            visits: link.stats.visits + 1
        });
        return true;
    }
    return false;
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}

// 格式化金额
function formatAmount(amount, currency) {
    return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: currency }).format(amount);
}

// 初始化存储
initStorage(); 