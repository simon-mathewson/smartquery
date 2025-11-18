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
                
       /*
                for val in data {
                    let u = UnicodeScalar(val)
                    print(Character(u))
                }
*/
                
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
                        let (name, n) = MySQL.Utils.lenEncStr(Array(data[pos..<data.count]))
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
    
    class BinaryRow: MysqlResult {
        
        fileprivate var con:Connection
        
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
            
            if !con.EOFfound, let cols = con.columns, cols.count > 0, let data = try con.socket?.readPacket() {
                //OK Packet
                if data[0] != 0x00 {
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
                    
                    //Error packet
                    if data[0] == 0xff {
                        throw con.handleErrorPacket(data)
                    }
                    
                    if data[0] > 0 && data[0] < 251 {
                        //Result set header packet
                        //Utils.le
                    }
                    else {
                        return nil
                    }
                    
                }
                
                var pos = 1 + (cols.count + 7 + 2)>>3
                let nullBitmap = Array(data[1..<pos])
                var row = Row()
                
                for i in 0..<cols.count {
                    
                    let idx = (i+2)>>3
                    let shiftval = UInt8((i+2)&7)
                    let val = nullBitmap[idx] >> shiftval
                    
                    if (val & 1) == 1 {
                        row.append(nil)
                        continue
                    }
                    
                    switch cols[i].fieldType {
                        
                    case MysqlTypes.MYSQL_TYPE_NULL:
                        row.append(nil)
                        break
                        
                    case MysqlTypes.MYSQL_TYPE_TINY:
                        if cols[i].flags & MysqlFieldFlag.UNSIGNED == MysqlFieldFlag.UNSIGNED {
                            let value = UInt8(data[pos..<pos+1])
                            row.append(String(value))
                            pos += 1
                            break
                        }
                        let value = Int8(data[pos..<pos+1])
                        row.append(String(value))
                        pos += 1
                        break
                        
                    case MysqlTypes.MYSQL_TYPE_SHORT:
                        if cols[i].flags & MysqlFieldFlag.UNSIGNED == MysqlFieldFlag.UNSIGNED {
                            let value = UInt16(data[pos..<pos+2])
                            row.append(String(value))
                            pos += 2
                            break
                        }
                        let value = Int16(data[pos..<pos+2])
                        row.append(String(value))
                        pos += 2
                        break
                        
                    case MysqlTypes.MYSQL_TYPE_INT24, MysqlTypes.MYSQL_TYPE_LONG:
                        if cols[i].flags & MysqlFieldFlag.UNSIGNED == MysqlFieldFlag.UNSIGNED {
                            let value = UInt(UInt32(data[pos..<pos+4]))
                            row.append(String(value))
                            pos += 4
                            break
                        }
                        let value = Int(Int32(data[pos..<pos+4]))
                        row.append(String(value))
                        pos += 4
                        break
                        
                    case MysqlTypes.MYSQL_TYPE_LONGLONG:
                        if cols[i].flags & MysqlFieldFlag.UNSIGNED == MysqlFieldFlag.UNSIGNED {
                            let value = UInt64(data[pos..<pos+8])
                            row.append(String(value))
                            pos += 8
                            break
                        }
                        let value = Int64(data[pos..<pos+8])
                        row.append(String(value))
                        pos += 8
                        break
                        
                    case MysqlTypes.MYSQL_TYPE_FLOAT:
                        let value = data[pos..<pos+4].float32()
                        row.append(String(value))
                        pos += 4
                        break
                        
                    case MysqlTypes.MYSQL_TYPE_DOUBLE:
                        let value = data[pos..<pos+8].float64()
                        row.append(String(value))
                        pos += 8
                        break
                        
                    case MysqlTypes.MYSQL_TYPE_TINY_BLOB, MysqlTypes.MYSQL_TYPE_MEDIUM_BLOB, MysqlTypes.MYSQL_TYPE_VARCHAR,
                        MysqlTypes.MYSQL_TYPE_VAR_STRING, MysqlTypes.MYSQL_TYPE_STRING, MysqlTypes.MYSQL_TYPE_LONG_BLOB,
                        MysqlTypes.MYSQL_TYPE_BLOB:
                        
                        if cols[i].charSetNr == 63 {
                            let (bres, n) = MySQL.Utils.lenEncBin(Array(data[pos..<data.count]))
                            if let binaryData = bres {
                                let base64String = Data(binaryData).base64EncodedString()
                                row.append(base64String)
                            } else {
                                row.append(nil)
                            }
                            pos += n
                        }
                        else {
                            let (str, n) = MySQL.Utils.lenEncStr(Array(data[pos..<data.count]))
                            row.append(str)
                            pos += n
                        }
                        break
                        
                    case MysqlTypes.MYSQL_TYPE_DECIMAL, MysqlTypes.MYSQL_TYPE_NEWDECIMAL,
                        MysqlTypes.MYSQL_TYPE_BIT, MysqlTypes.MYSQL_TYPE_ENUM, MysqlTypes.MYSQL_TYPE_SET,
                        MysqlTypes.MYSQL_TYPE_GEOMETRY:
                        
                        let (str, n) = MySQL.Utils.lenEncStr(Array(data[pos..<data.count]))
                        row.append(str)
                        pos += n
                        break
                        
                    case MysqlTypes.MYSQL_TYPE_DATE://, MysqlTypes.MYSQL_TYPE_NEWDATE:
                        let (dlen, n) = MySQL.Utils.lenEncInt(Array(data[pos..<data.count]))
                        
                        guard dlen != nil else {
                            row.append(nil)
                            break
                        }
                        var y = 0, mo = 0, d = 0
                        var dateString: String?
                        
                        switch Int(dlen!) {
                        case 11:
                            fallthrough
                        case 7:
                            fallthrough
                        case 4:
                            // 2015-12-02
                            y = Int(data[pos+1..<pos+3].uInt16())
                            mo = Int(data[pos+3])
                            d = Int(data[pos+4])
                            dateString = String(format: "%4d-%02d-%02d", arguments: [y, mo, d])
                            break
                        default:break
                        }
                        
                        row.append(dateString)
                        pos += n + Int(dlen!)
                        
                        break

                    case MysqlTypes.MYSQL_TYPE_TIME:
                        let (dlen, n) = MySQL.Utils.lenEncInt(Array(data[pos..<data.count]))
                        
                        guard dlen != nil else {
                            row.append(nil)
                            break
                        }
                        var h = 0, m = 0, s = 0, u = 0
                        var timeString: String?
                        
                        switch Int(dlen!) {
                        case 12:
                            //12:03:15.000 001
                            u = Int(data[pos+9..<pos+13].uInt32())
                            fallthrough
                        case 8:
                            //12:03:15
                            h = Int(data[pos+6])
                            m = Int(data[pos+7])
                            s = Int(data[pos+8])
                            timeString = String(format: "%02d:%02d:%02d.%06d", arguments: [h, m, s, u])
                            break
                        default:
                            timeString = "00:00:00"
                            break
                        }
                        
                        row.append(timeString)
                        pos += n + Int(dlen!)
                        
                        break

                    case MysqlTypes.MYSQL_TYPE_TIMESTAMP, MysqlTypes.MYSQL_TYPE_DATETIME:
                        
                        let (dlen, n) = MySQL.Utils.lenEncInt(Array(data[pos..<data.count]))
                        
                        guard dlen != nil else {
                            row.append(nil)
                            break
                        }
                        var y = 0, mo = 0, d = 0, h = 0, m = 0, s = 0, u = 0
                        var dateTimeString: String?
                        
                        switch Int(dlen!) {
                        case 11:
                            // 2015-12-02 12:03:15.001004005
                            u = Int(data[pos+8..<pos+12].uInt32())
                            fallthrough
                        case 7:
                            // 2015-12-02 12:03:15
                            h = Int(data[pos+5])
                            m = Int(data[pos+6])
                            s = Int(data[pos+7])
                            fallthrough
                        case 4:
                            // 2015-12-02
                            y = Int(data[pos+1..<pos+3].uInt16())
                            mo = Int(data[pos+3])
                            d = Int(data[pos+4])
                            dateTimeString = String(format: "%4d-%02d-%02d %02d:%02d:%02d.%06d", arguments: [y, mo, d, h, m, s, u])
                            break
                            
                        default:break
                        }
                        
                        row.append(dateTimeString)
                        pos += n + Int(dlen!)
                        break
                    default:
                        row.append(nil)
                        break
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
