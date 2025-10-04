import {useI18n} from 'vue-i18n'

export const formatReleaseDate = (dateString: string) => {
    const {locale} = useI18n()
    const date = new Date(dateString)
    const isChinese = locale.value === 'zh'

    if (isChinese) {
        // CN使用UTC+8
        return new Intl.DateTimeFormat('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'Asia/Shanghai',
            timeZoneName: 'short'
        }).format(date)
    } else {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'UTC',
            timeZoneName: 'short'
        }).format(date)
    }
}
