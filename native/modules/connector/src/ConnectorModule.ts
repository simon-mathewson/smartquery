import { NativeModule, requireNativeModule } from "expo";

import type {
  ConnectDb,
  DisconnectDb,
  RunQuery,
} from "../../../../shared/native/types";

declare class ConnectorModule extends NativeModule {
  connectDb: ConnectDb;
  disconnectDb: DisconnectDb;
  runQuery: RunQuery;
}

export default requireNativeModule<ConnectorModule>("Connector");
