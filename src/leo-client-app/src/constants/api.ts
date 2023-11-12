import axios, { HttpStatusCode } from "axios";

export const BACKEND_URL = "http://localhost:3001";

export const getAllOperators = async () => {
  const operators = await axios.get(`${BACKEND_URL}/getAllOperators`);
  return operators.data;
};
