import SatelliteName from "@/components/SatelliteName";
import axios from "axios";
import { stringify } from "querystring";

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACK_END_URL;
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

export const addNewSatellite = async (
  satelliteName: string,
  noradID: string,
  userId: string
) => {
  const body = {
    name: satelliteName,
    noradId: noradID,
    userId,
  };
  const res = await axios.post(
    `${BACKEND_URL}/satellite/addSatelliteTarget`,
    body,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return res.data;
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
    body,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return res.data;
};

export const removeCommandFromSchedule = async (
  commandId: string,
  userId: string
) => {
  const res = await axios.delete(
    `${BACKEND_URL}/schedule/deleteScheduledCommand`,
    {
      params: {
        commandId,
        userId,
      },
    }
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

export const getUserSatellites = async (userId: string) => {
  const res = await axios.get(`${BACKEND_URL}/users/getUserSatellites`, {
    params: { userId: userId },
  });

  return res.data;
};
