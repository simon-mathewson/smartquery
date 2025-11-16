import { NativeModule, requireNativeModule } from "expo";

import type { RemoteConnection } from "../../../../shared/connections/types";
import type { NewResults } from "../../../../shared/connector/types";

declare class ConnectorModule extends NativeModule {
  connectDb: (connection: RemoteConnection) => Promise<string>;
  disconnectDb: (connectorId: string) => Promise<void>;
  runQuery: (connectorId: string, statements: string[]) => Promise<NewResults>;
}

export default requireNativeModule<ConnectorModule>("Connector");
