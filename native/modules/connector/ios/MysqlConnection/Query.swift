import Foundation

public extension MySQL.Connection {
    func nextResult() throws -> MysqlResult {
        let resLen = try readResultSetHeaderPacket()
        self.columns = try readColumns(resLen)
        
        return MySQL.TextRow(con: self)
    }


    func query(_ q:String) throws -> MysqlResult {
        guard self.socket != nil else {
            throw MySQL.Connection.ConnectionError.notConnected
        }

        try self.writeCommandPacketStr(MysqlCommands.COM_QUERY, q: q)
        
        let resLen = try self.readResultSetHeaderPacket()
        self.columns = try self.readColumns(resLen)
        
        return MySQL.TextRow(con: self)
    }
}
