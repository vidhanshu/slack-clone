import { atom, useAtom } from "jotai";

const modalState = atom(false);

export const useCreateChanelModal = () => {
  return useAtom(modalState);
};
