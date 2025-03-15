// 支付处理逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 获取链接ID
    const urlParams = new URLSearchParams(window.location.search);
    const shortId = urlParams.get('id');
    
    if (!shortId) {
        showError('缺少链接参数');
        return;
    }
    
    // 获取链接信息
    const link = getLinkByShortId(shortId);
    
    if (!link) {
        showError('无效的支付链接');
        return;
    }
    
    // 验证链接状态
    if (link.status !== 'ACTIVE') {
        showError('此支付链接已失效');
        return;
    }
    
    // 记录访问
    recordLinkVisit(link.id);
    
    // 显示商品信息
    document.getElementById('productTitle').textContent = link.title;
    
    // 显示图片(如果有)
    if (link.imageUrl) {
        const imgElement = document.createElement('img');
        imgElement.src = link.imageUrl;
        imgElement.alt = link.title;
        imgElement.className = 'img-fluid rounded';
        imgElement.style.maxHeight = '200px';
        document.getElementById('productImage').appendChild(imgElement);
    }
    
    // 显示金额
    if (link.amount.type === 'FIXED') {
        // 显示详细价格信息
        document.getElementById('productUnitPrice').textContent = formatAmount(link.amount.value, link.amount.currency);
        document.getElementById('productQuantity').textContent = link.amount.quantity || 1;
        document.getElementById('productAmount').textContent = formatAmount(link.amount.totalValue || link.amount.value, link.amount.currency);
        document.getElementById('dynamicAmountSection').classList.add('d-none');
        document.getElementById('fixedAmountSection').classList.remove('d-none');
    } else {
        // 动态金额 - 允许用户输入
        document.getElementById('fixedAmountSection').classList.add('d-none');
        document.getElementById('dynamicAmountSection').classList.remove('d-none');
        
        // 设置货币和初始值
        const currencySelect = document.getElementById('dynamicCurrency');
        currencySelect.value = link.amount.currency;
        
        const amountInput = document.getElementById('dynamicAmount');
        
        // 设置一个合理的默认值
        const defaultAmount = link.amount.minValue || 1.00;
        amountInput.value = defaultAmount;
        
        // 更新总金额显示
        document.getElementById('dynamicTotalAmount').textContent = formatAmount(defaultAmount, link.amount.currency);
        
        if (link.amount.minValue) {
            amountInput.min = link.amount.minValue;
            amountInput.placeholder = `最小 ${formatAmount(link.amount.minValue, link.amount.currency)}`;
        }
        
        if (link.amount.maxValue) {
            amountInput.max = link.amount.maxValue;
            
            if (link.amount.minValue) {
                amountInput.placeholder += ` - `;
            }
            
            amountInput.placeholder += `最大 ${formatAmount(link.amount.maxValue, link.amount.currency)}`;
        }
        
        // 监听金额变化
        amountInput.addEventListener('input', function() {
            const amount = parseFloat(this.value);
            if (isNaN(amount) || amount <= 0) {
                document.getElementById('dynamicAmountError').style.display = 'block';
                document.getElementById('dynamicAmountError').textContent = '请输入有效金额';
                document.getElementById('dynamicTotalAmount').textContent = '--';
                document.getElementById('payButton').disabled = true;
                return;
            }
            
            // 验证最小/最大值
            if (link.amount.minValue && amount < link.amount.minValue) {
                document.getElementById('dynamicAmountError').style.display = 'block';
                document.getElementById('dynamicAmountError').textContent = `最小金额为 ${formatAmount(link.amount.minValue, link.amount.currency)}`;
                document.getElementById('payButton').disabled = true;
                return;
            }
            
            if (link.amount.maxValue && amount > link.amount.maxValue) {
                document.getElementById('dynamicAmountError').style.display = 'block';
                document.getElementById('dynamicAmountError').textContent = `最大金额为 ${formatAmount(link.amount.maxValue, link.amount.currency)}`;
                document.getElementById('payButton').disabled = true;
                return;
            }
            
            // 金额有效
            document.getElementById('dynamicAmountError').style.display = 'none';
            document.getElementById('dynamicTotalAmount').textContent = formatAmount(amount, link.amount.currency);
            document.getElementById('payButton').disabled = false;
        });
        
        // 触发一次input事件确保初始状态正确
        amountInput.dispatchEvent(new Event('input'));
    }
    
    // 绑定支付方式选择
    document.querySelectorAll('.payment-method').forEach(method => {
        method.addEventListener('click', function() {
            document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
    
    // 绑定支付按钮
    document.getElementById('payButton').addEventListener('click', function() {
        // 获取选择的支付方式
        const selectedMethod = document.querySelector('.payment-method.selected');
        if (!selectedMethod) {
            alert('请选择支付方式');
            return;
        }
        
        const paymentMethod = selectedMethod.getAttribute('data-method');
        
        // 获取支付金额
        let amount;
        if (link.amount.type === 'FIXED') {
            amount = link.amount.totalValue || link.amount.value;
        } else {
            // 使用用户输入的动态金额
            const inputValue = document.getElementById('dynamicAmount').value;
            console.log("用户输入的金额:", inputValue); // 调试信息
            
            amount = parseFloat(inputValue);
            
            // 验证动态金额
            if (isNaN(amount) || amount <= 0) {
                alert('请输入有效金额');
                return;
            }
            
            // 验证最小/最大值
            if (link.amount.minValue && amount < link.amount.minValue) {
                alert(`最小金额为 ${formatAmount(link.amount.minValue, link.amount.currency)}`);
                return;
            }
            
            if (link.amount.maxValue && amount > link.amount.maxValue) {
                alert(`最大金额为 ${formatAmount(link.amount.maxValue, link.amount.currency)}`);
                return;
            }
            
            console.log("验证后的最终金额:", amount); // 调试信息
        }
        
        // 确保金额有效
        if (!amount || amount <= 0) {
            alert('支付金额无效');
            return;
        }
        
        // 记录交易数据
        const transaction = {
            linkId: link.id,
            merchantId: link.merchantId || 'demo_merchant',
            amount: amount,
            currency: link.amount.currency,
            paymentMethod: paymentMethod,
            status: 'completed',
            customerInfo: {
                email: 'customer@example.com',
                name: 'Demo Customer'
            }
        };
        
        console.log("提交的交易信息:", transaction); // 调试信息
        
        const savedTransaction = recordTransaction(transaction);
        
        // 直接跳转到成功页面
        window.location.href = `success.html?id=${savedTransaction.id}`;
    });
});

// 显示错误
function showError(message) {
    document.getElementById('paymentCard').classList.add('d-none');
    showPaymentResult(false, '支付无法完成', message);
}

// 显示支付结果
function showPaymentResult(success, title, message) {
    document.getElementById('processingCard').classList.add('d-none');
    document.getElementById('resultCard').classList.remove('d-none');
    
    document.getElementById('resultTitle').textContent = title;
    document.getElementById('resultMessage').textContent = message;
    
    if (success) {
        document.getElementById('successIcon').classList.remove('d-none');
        document.getElementById('errorIcon').classList.add('d-none');
    } else {
        document.getElementById('successIcon').classList.add('d-none');
        document.getElementById('errorIcon').classList.remove('d-none');
    }
} 