import { useQuery } from "@tanstack/react-query";
import {
  getAllOperators,
  getCommandsBySchedule,
  getSchedulesBySatellite,
  getValidCommands,
} from "./api";

export const useGetAllOperators = () => {
  return useQuery({
    queryKey: ["useGetAllOperators"],
    queryFn: () => getAllOperators(),
  });
};

export const useGetCommandsBySchedule = (
  scheduleId: string,
  limit?: number
) => {
  return useQuery({
    queryKey: ["useGetCommandsBySchedule"],
    queryFn: () => getCommandsBySchedule(scheduleId, limit),
    enabled: !!scheduleId,
  });
};

export const useGetValidCommands = (satelliteId: string, userId: string) => {
  return useQuery({
    queryKey: ["useGetValidCommands"],
    queryFn: () => getValidCommands(satelliteId, userId),
    enabled: !!satelliteId && !!userId,
  });
};

export const useGetSchedulesBySatellite = (
  satelliteId: string,
  limit?: number,
  status?: string,
  page?: number
) => {
  return useQuery({
    queryKey: ["useGetSchedulesBySatellite"],
    queryFn: () => getSchedulesBySatellite(satelliteId, limit, status, page),
    enabled: !!satelliteId,
  });
};
