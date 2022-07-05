export const refreshTable = (ctx, config) => {
  debugger
  return ctx.table.refreshTable.apply(ctx.table, config.args);
};

export const resetTable = (ctx, config) => {
  return ctx.table.resetTable.apply(ctx.table, config.args);
};
