// 添加判断是否为中国用户的函数
export const isChinaUser = async () => {
    try {
        // 使用IP地理位置API判断用户位置
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        return data.country_code === 'CN';
    } catch (error) {
        console.warn('Failed to get user location, defaulting to non-China', error);
        return false;
    }
};