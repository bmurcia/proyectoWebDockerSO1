
--Modificar para agregar tablas en SQL--
alter table Supervisor
add Qty int;

--Store procedure--

create procedure St_Update_Qty
@idempleado int
as
	Declare @qtycuidaanimal int
		set @qtycuidaanimal = (select count(a.Id_Supervisor)
							from Animal a
							where a.Id_Supervisor = @idempleado)
		update Supervisor
			set Qty = @qtycuidaanimal
		where Id_Empleado = @idempleado

-- Call Store procedure
Exec St_Update_Qty 101

-- Actualizando un Procedure utilizando una funcion---
alter procedure St_Update_Qty
@idempleado int
as
	Declare @qtycuidaanimal int
		set @qtycuidaanimal = (select dbo.Fn_Get_Qty(@idempleado))
		update Supervisor
			set Qty = @qtycuidaanimal
		where Id_Empleado = @idempleado

Exec St_Update_Qty 104

--Creacion de Trigger--
create trigger T_Update_Qty
    on Animal
    after insert
as 
begin
    Set NoCount On
    update Supervisor
        set Qty = Qty+1
    where Id_Empleado = (select Id_Supervisor from inserted)
end 


--COMO VER TABLAS--
use [Example DB]
SELECT name FROM Sys.tables

--COMO VER COLUMNAS DE TABLAS --
SELECT COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Supervisor'

