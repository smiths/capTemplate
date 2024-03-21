import { useQuery } from "@tanstack/react-query";
import {
  getAllOperators,
  getCommandsBySchedule,
  getValidCommands,
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

export const useGetValidCommands = (satelliteId: string, userId: string) => {
  return useQuery({
    queryKey: ["useGetValidCommands"],
    queryFn: () => getValidCommands(satelliteId, userId),
    enabled: !!satelliteId && !!userId,
  });
};
