import logActivity from "../../services/audit/logActivity.service.js";

export const logActivityUseCase = async (data) => {
    logActivity(data);
};

export default logActivityUseCase;