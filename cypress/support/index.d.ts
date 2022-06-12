export interface MessagePayload {
    from: string;
    to: string;
    subject: string;
    message: string;
    userId?: string;
}

export interface MessageModifyPayload {
    addLabelIds?: string[];
    removeLabelIds?: string[];
    id: string;
    userId?: string;
}
