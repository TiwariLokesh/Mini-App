export const formatDateTime = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString();
};

export const formatOperation = (type: string, operand: number) => {
  const symbols: Record<string, string> = {
    add: "+",
    subtract: "-",
    multiply: "×",
    divide: "÷"
  };
  return `${symbols[type] ?? type} ${operand}`;
};
