import {createContext, useContext} from 'react';

// Shared by every sheet component: the character model `m`, the writer `w`,
// `run` (wraps a write and shows its error), `open(tableKey, id)`, raw records and fields.
export const SheetContext = createContext(null);
export const useSheet = () => useContext(SheetContext);
