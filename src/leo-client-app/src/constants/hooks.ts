import { useQuery } from "@tanstack/react-query";
import {
  getAllOperators,
  getCommandsBySchedule,
  getUserSatellites,
} from "./api";

export const useGetAllOperators = () => {
  return useQuery({
    queryKey: ["useGetAllOperators"],
    queryFn: () => getAllOperators(),
  });
};

export const useGetCommandsBySchedule = (scheduleId: string) => {
  return useQuery({
    queryKey: ["useGetCommandsBySchedule"],
    queryFn: () => getCommandsBySchedule(scheduleId),
    enabled: !!scheduleId,
  });
};

export const useGetUserSatellites = (userId: string) => {
  return useQuery({
    queryKey: ["useGetUserSatellites"],
    queryFn: () => getUserSatellites(userId),
    enabled: !!userId,
  });
};
