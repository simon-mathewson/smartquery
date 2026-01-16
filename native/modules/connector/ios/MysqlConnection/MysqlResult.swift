import Foundation

public protocol MysqlResult {
    init(con:MySQL.Connection)
    func readRow() throws -> MySQL.Row?
    func readAllRows() throws -> [MySQL.ResultSet]?
}

extension MySQL {
    public typealias Row = [String?]
    public typealias ResultSet = [Row]
    
    class TextRow: MysqlResult {
        
        var con:Connection
        
        required init(con:Connection) {
            self.con = con
        }
        
        func readRow() throws -> MySQL.Row?{
            
            guard con.isConnected == true else {
                throw Connection.ConnectionError.notConnected
            }
            
            if con.columns?.count == 0 {
                con.hasMoreResults = false
                con.EOFfound = true
            }
            
            if !con.EOFfound, let cols = con.columns, cols.count > 0, let data = try con.socket?.readPacket()  {
                
                // EOF Packet
                if (data[0] == 0xfe) && (data.count == 5) {
                    con.EOFfound = true
                    let flags = Array(data[3..<5]).uInt16()
                    
                    if flags & MysqlServerStatus.SERVER_MORE_RESULTS_EXISTS == MysqlServerStatus.SERVER_MORE_RESULTS_EXISTS {
                        con.hasMoreResults = true
                    }
                    else {
                        con.hasMoreResults = false
                    }

                    return nil
                }
                
                if data[0] == 0xff {
                    throw con.handleErrorPacket(data)
                }
                
                var row = Row()
                var pos = 0
                
                if cols.count > 0 {
                    for i in 0...cols.count-1 {
                        let remainingData = Array(data[pos..<data.count])
                        let (name, n) = MySQL.Utils.lenEncStr(remainingData)
                        pos += n
                        
                        if let val = name {
                            row.append(String(val))
                        }
                        else {
                            row.append(nil)
                        }
                    }
                }
                
                return row
            }
            
            return nil

        }
        
        func readAllRows() throws -> [ResultSet]? {
            
            var arr = [ResultSet]()
            
            repeat {
                
                if con.hasMoreResults {
                    try _ = con.nextResult()
                }
                
                var rows = ResultSet()
                
                while let row = try readRow() {
                    rows.append(row)
                }
                
                if (rows.count > 0){
                    arr.append(rows)
                }
                
            } while con.hasMoreResults
            
            return arr
        }
    }
}
