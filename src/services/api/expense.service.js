import { baseService } from './base.service';
import { ENDPOINTS } from '../../constants';

export const expenseService = {
  createExpense: (data) => baseService.post(ENDPOINTS.EXPENSES.CREATE, data),
  getGroupExpenses: (groupId) => baseService.get(ENDPOINTS.EXPENSES.GROUP(groupId)),
  settleMyShare: (id, data) => baseService.put(ENDPOINTS.EXPENSES.SETTLE(id), data),
  deleteExpense: (id) => baseService.delete(ENDPOINTS.EXPENSES.DELETE(id)),
};
