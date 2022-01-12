// 统一返回格式
var response = (status, message, data) => {
    return {
        status: status || '',
        message: message || '',
        data: data || []
    }
}

module.exports = response