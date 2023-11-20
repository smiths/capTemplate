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
