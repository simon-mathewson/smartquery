import Foundation

public extension MySQL.Connection {
    func nextResult() throws -> MysqlResult {
        let resLen = try readResultSetHeaderPacket()
        self.columns = try readColumns(resLen)
        
        return MySQL.TextRow(con: self)
        
    }
    
    func prepare(_ q:String) throws -> MySQL.Statement {
        guard self.socket != nil else {
            throw MySQL.Connection.ConnectionError.notConnected
        }
        
        try writeCommandPacketStr(MysqlCommands.COM_STMT_PREPARE, q: q)
        let stmt = MySQL.Statement(con: self)
        
        if let colCount = try stmt.readPrepareResultPacket(), let  paramCount = stmt.paramCount {
            if paramCount > 0 {
                try readUntilEOF()
            }
            
            if colCount > 0 {
                try readUntilEOF()
            }
        }
        else {
            throw MySQL.Connection.ConnectionError.statementPrepareError("Could not get col and param count")
        }
        
        return stmt
    }
}
