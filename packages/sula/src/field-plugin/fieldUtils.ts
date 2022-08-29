export const judgeIsEmpty = (value: any) => {
  if (value == null || value == undefined || String(value).trim() == '') {
    return true;
  }
  return false;
};