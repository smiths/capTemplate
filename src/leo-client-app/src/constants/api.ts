import axios, { HttpStatusCode } from "axios";

export const BACKEND_URL = "http://localhost:3001";

export const getAllOperators = async () => {
  const operators = await axios.get(`${BACKEND_URL}/users/getAllOperators`);
  return operators.data;
};

export const updateOperatorRole = async (userId: string, data: any) => {
  const operator = await axios.patch(
    `${BACKEND_URL}/users/updateOperatorRole/${userId}`,
    {
      params: { userId: userId },
      body: data,
    }
  );
  return operator.data;
};

export const sendCommandSchedule = async (
  userId: string,
  scheduleId: string,
  satelliteId: string,
  commands: string[]
) => {
  const body = {
    userId,
    scheduleId,
    satelliteId,
    commands,
  };

  const res = await axios.post(
    `${BACKEND_URL}/schedule/createBatchScheduledCommand`,
    body
  );
  return res.data;
};

export const getCommandsBySchedule = async (scheduleId: string) => {
  const res = await axios.get(`${BACKEND_URL}/schedule/getCommandsBySchedule`, {
    params: {
      scheduleId,
      limit: 100,
    },
  });
  return res.data;
};
