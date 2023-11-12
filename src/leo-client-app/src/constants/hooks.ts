import { useQuery } from "@tanstack/react-query";
import { getAllOperators } from "./api";

export const useGetAllOperators = () => {
  return useQuery({
    queryKey: ["useGetAllOperators"],
    queryFn: () => getAllOperators(),
  });
};
