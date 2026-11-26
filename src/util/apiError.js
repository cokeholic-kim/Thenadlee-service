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

// 서버가 "없음(404)"이라고 답한 경우만 (네트워크 오류·서버 오류·검색 로봇의 API 차단은 아님)
export const isNotFoundError = (error) => error?.response?.status === 404;
