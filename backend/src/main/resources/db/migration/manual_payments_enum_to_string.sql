-- Chuyển payments.method / payments.status từ số thứ tự sang chuỗi (EnumType.STRING).
-- Chạy được nhiều lần: chỉ đổi khi cột còn là kiểu số.
alter table payments drop constraint if exists payments_method_check;
alter table payments drop constraint if exists payments_status_check;

do $$
begin
  if (select data_type from information_schema.columns
      where table_name = 'payments' and column_name = 'method') in ('smallint', 'integer') then
    alter table payments alter column method type varchar(20) using
      case method when 0 then 'COD' when 1 then 'VNPAY' when 2 then 'CREDIT_CARD' when 3 then 'SEPAY' end;
  end if;
  if (select data_type from information_schema.columns
      where table_name = 'payments' and column_name = 'status') in ('smallint', 'integer') then
    alter table payments alter column status type varchar(20) using
      case status when 0 then 'PENDING' when 1 then 'COMPLETED' when 2 then 'FAILED' when 3 then 'REFUNDED' end;
  end if;
end $$;
