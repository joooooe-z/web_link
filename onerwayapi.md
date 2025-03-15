# Onerway API 用户数据需求

## 1. 通用必填信息

| 字段 | 类型 | 描述 | 适用场景 |
|-----|-----|------|---------|
| merchantTxnId | String | 顾客每次付款的订单号 | 所有支付场景 |
| orderAmount | String | 订单金额 | 所有支付场景 |
| orderCurrency | String | 交易订单币种(ISO 4217) | 所有支付场景 |

## 2. 用户账单信息 (billingInformation)

| 字段 | 类型 | 描述 | 是否必填 |
|-----|-----|------|---------|
| firstName | String | 用户名 | 是 |
| lastName | String | 用户姓 | 是 |
| phone | String | 电话号码 | 是 |
| email | String | 电子邮箱 | 是 |
| postalCode | String | 邮政编码 | 是 |
| address | String | 详细地址 | 是 |
| country | String | 国家 | 是 |
| province | String | 省/州 | 是 |
| city | String | 城市 | 是 |
| street | String | 街道 | 是 |
| number | Integer | 门牌号 | 是 |
| identityNumber | String | 身份证号 | 是 |

## 3. 配送信息 (shippingInformation)

| 字段 | 类型 | 描述 | 是否必填 |
|-----|-----|------|---------|
| firstName | String | 收件人名 | 是 |
| lastName | String | 收件人姓 | 是 |
| phone | String | 收件人电话 | 是 |
| email | String | 收件人邮箱 | 是 |
| postalCode | String | 邮政编码 | 是 |
| address | String | 详细地址 | 是 |
| country | String | 国家 | 是 |
| province | String | 省/州 | 是 |
| city | String | 城市 | 是 |
| street | String | 街道 | 是 |
| number | Integer | 门牌号 | 是 |
| identityNumber | String | 身份证号 | 是 |

## 4. 订阅支付特有信息 (subscription)

| 字段 | 类型 | 描述 | 是否必填 |
|-----|-----|------|---------|
| merchantCustId | String | 商户客户ID | 是 |
| expireDate | String | 过期日期(yyyy-MM-dd) | 是 |
| frequencyType | String | 订阅频率类型(D-天) | 是 |
| frequencyPoint | String | 订阅频率点数 | 是 |
| cycleCount | Integer | 循环期数(1-100) | 否 |
| notificationEmail | String | 订阅通知邮箱 | 否 |
| productName | String | 订阅商品名称 | 否 |
| trialDays | Integer | 试用天数(3-365) | 否 |
| trialEnd | String | 试用结束时间(yyyy-MM-dd) | 否 |
| trialFromPlan | String | 试用模式(0-不包含/1-包含) | 否 |

## 5. 本地支付方式信息 (lpmsInfo)

| 字段 | 类型 | 描述 | 是否必填 |
|-----|-----|------|---------|
| lpmsType | String | 本地支付方式 | 是 |
| bankName | String | 银行名称 | 否 |
| iBan | String | 银行账户 | 否 |
| walletAccountId | String | 钱包/本地账户id | 否 |
| walletAccountName | String | 钱包/本地账户名称 | 否 |
| prepaidNumber | String | 预付费卡号 | 否 |

## 6. 商品信息 (goodsInfo)

| 字段 | 类型 | 描述 | 是否必填 |
|-----|-----|------|---------|
| goodsType | String | 商品类型 | 是 |
| goodsName | String | 商品名称 | 是 |
| goodsUnitPrice | String | 商品单价 | 是 |
| goodsQuantity | Integer | 商品数量 | 是 |
| goodsUrl | String | 商品链接 | 否 |

## 7. 注意事项

1. 数据格式规范：
   - 所有金额相关的字段都需要使用字符串类型
   - 日期格式统一使用 yyyy-MM-dd
   - 时间格式统一使用 yyyy-MM-dd HH:mm:ss
   - 币种代码需要符合 ISO 4217 标准

2. 安全要求：
   - 所有敏感信息传输必须使用 HTTPS
   - 身份证号等敏感信息需要加密处理
   - API 调用需要携带有效的 token

3. 错误处理：
   - 所有必填字段缺失将返回对应的错误码
   - 数据格式错误将返回格式校验失败信息
   - 建议实现错误重试机制

4. 支付流程：
   - 聚合收银台：适用于一次性支付
   - 订阅支付：适用于周期性扣款
   - 授权支付：适用于预授权场景

5. 测试建议：
   - 建议先使用测试环境进行接口联调
   - 提供测试账号和测试数据进行验证
   - 验证各种异常场景的处理逻辑
