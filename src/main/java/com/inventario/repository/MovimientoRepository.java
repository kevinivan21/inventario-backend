package com.inventario.repository;

import com.inventario.model.Movimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

public interface MovimientoRepository extends JpaRepository<Movimiento, Long> {

    @Transactional
    @Modifying
    @Query("DELETE FROM Movimiento m WHERE m.producto.id_producto = :idProducto")
    void eliminarMovimientosPorProducto(Long idProducto);
}