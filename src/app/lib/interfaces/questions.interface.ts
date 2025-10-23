export interface Option {
    label: string;
    correct: boolean;
}

export interface Question {
    label: string;
    options: Option[];
}