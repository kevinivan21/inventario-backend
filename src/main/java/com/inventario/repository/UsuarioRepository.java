package com.inventario.repository;

import com.inventario.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Usuario findFirstByUsuarioAndContrasena(String usuario, String contrasena);

}