
export type ISendEmailReq = {
    requestId: string,
    recipent: string[],
    subject: string,
    body: string,
    isHtmlBody: boolean
}