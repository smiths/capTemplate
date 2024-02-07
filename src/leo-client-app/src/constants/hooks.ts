import { useQuery } from "@tanstack/react-query";
import { getAllOperators, getCommandsBySchedule } from "./api";

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
