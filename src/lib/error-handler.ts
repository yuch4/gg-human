// エラーメッセージの定義
export const errorMessages = {
    // データベースエラー
    '23505': {
      email: 'このメールアドレスは既に登録されています。別のメールアドレスを使用してください。',
      default: '一意性制約違反が発生しました。'
    },
    '23503': '指定された会社または部署が存在しません。',
    '23502': '必須項目が入力されていません。',
    
    // バリデーションエラー
    validation: {
      required: 'この項目は必須です',
      email: '正しいメールアドレスの形式で入力してください',
      minLength: (min: number) => `${min}文字以上で入力してください`,
      maxLength: (max: number) => `${max}文字以下で入力してください`,
    },
    
    // その他のエラー
    default: '予期せぬエラーが発生しました。時間をおいて再度お試しください。',
    network: 'ネットワークエラーが発生しました。インターネット接続を確認してください。',
    timeout: 'サーバーとの通信がタイムアウトしました。時間をおいて再度お試しください。'
  }
  
  export function getErrorMessage(error: any): string {
    if (error.code) {
      // PostgreSQLエラー
      if (errorMessages[error.code]) {
        if (error.detail?.includes('email')) {
          return errorMessages[error.code].email
        }
        return errorMessages[error.code].default || errorMessages[error.code]
      }
    }
    
    // ネットワークエラー
    if (!navigator.onLine) {
      return errorMessages.network
    }
    
    return errorMessages.default
  }