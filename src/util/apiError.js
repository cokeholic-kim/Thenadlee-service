// 백엔드 공통 응답 { result: { resultCode, resultMessage, resultDescription }, body } 에서 에러 메시지 추출
const DEFAULT_ERROR_MESSAGE = '요청 처리 중 오류가 발생했습니다.';

export const getApiErrorMessage = (error) => {
    const result = error?.response?.data?.result;
    if (!result) {
        return DEFAULT_ERROR_MESSAGE;
    }
    const isDetailMessage = result.resultDescription && result.resultDescription !== '에러발생';
    return isDetailMessage ? result.resultDescription : result.resultMessage;
};
