import { NativeModule, requireNativeModule } from "expo";

import type {
  ConnectDb,
  DisconnectDb,
  RunQuery,
  SwitchCatalogOrSchema,
} from "../../../../shared/native/types";

declare class ConnectorModule extends NativeModule {
  isIosOnMac: boolean;
  writeToClipboard: (text: string) => void;
  connectDb: ConnectDb;
  switchCatalogOrSchema: SwitchCatalogOrSchema;
  disconnectDb: DisconnectDb;
  runQuery: RunQuery;
}

export default requireNativeModule<ConnectorModule>("Connector");
