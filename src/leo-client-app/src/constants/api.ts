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

export const addNewSatellite = async (satelliteName: string, noradID: string) => {
  const body = {
    name: satelliteName,
    noradId: noradID
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

export const getCommandsBySchedule = async (
  scheduleId: string,
  limit?: number
) => {
  const configLimit = limit ?? 100;

  const res = await axios.get(`${BACKEND_URL}/schedule/getCommandsBySchedule`, {
    params: {
      scheduleId,
      limit: configLimit,
    },
  });
  return res.data;
};

export const getValidCommands = async (satelliteId: string, userId: string) => {
  const res = await axios.get(
    `${BACKEND_URL}/satelliteUser/getCommandsBySatelliteAndUser`,
    {
      params: {
        satelliteId,
        userId,
      },
    }
  );
  return res.data;
};

export const getSchedulesBySatellite = async (
  satelliteId: string,
  limit?: number,
  status?: string,
  page?: number
) => {
  const res = await axios.get(
    `${BACKEND_URL}/schedule/getSchedulesBySatellite`,
    {
      params: {
        satelliteId,
        ...(limit && { limit }),
        ...(status && { status }),
        ...(page && { page }),
      },
    }
  );
  return res.data;
};

export const sendCommandToForwarder = async (
  userId: string,
  scheduleId: string,
  satelliteId: string,
  command: string
) => {
  const config = {
    params: { userId, scheduleId, satelliteId },
  };

  const body = {
    command,
  };
  const res = await axios.post(
    `${BACKEND_URL}/forwarder/sendCommand`,
    body,
    config
  );
  return res.data;
};

export const executeSchedule = async (
  scheduleId: string,
  satelliteId: string
) => {
  const config = {
    params: { scheduleId, satelliteId },
  };

  const res = await axios.post(
    `${BACKEND_URL}/schedule/executeSchedule`,
    null,
    config
  );
  return res.data;
};

export const stopSchedule = async (scheduleId: string, satelliteId: string) => {
  const config = {
    params: { scheduleId, satelliteId },
  };

  const res = await axios.post(
    `${BACKEND_URL}/schedule/cancelSchedule`,
    null,
    config
  );
  return res.data;
};

export const getLogByCommand = async (commandId: string) => {
  const res = await axios.get(`${BACKEND_URL}/log/getLogByCommand`, {
    params: {
      commandId,
    },
  });
  return res.data;
};

export const getPingSocket = async () => {
  const res = await axios.get(`${BACKEND_URL}/ping`);
  return res.data;
};
