using Dapper;
using System.Data;

namespace LifeBoard.Infrastructure;

/// <summary>
/// Teaches Dapper how to read/write DateOnly from MySQL DATE columns.
/// This permanently solves the timezone date issue.
/// </summary>
public class DateOnlyTypeHandler : SqlMapper.TypeHandler<DateOnly>
{
    public static readonly DateOnlyTypeHandler Instance = new();

    public override DateOnly Parse(object value) => value switch
    {
        DateTime dt => DateOnly.FromDateTime(dt),
        DateOnly d  => d,
        string s    => DateOnly.Parse(s),
        _           => throw new InvalidCastException($"Cannot convert {value.GetType()} to DateOnly")
    };

    public override void SetValue(IDbDataParameter parameter, DateOnly value)
    {
        parameter.DbType = DbType.Date;
        parameter.Value  = value.ToDateTime(TimeOnly.MinValue);
    }
}
