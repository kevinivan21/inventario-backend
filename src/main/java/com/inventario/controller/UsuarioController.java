package com.inventario.controller;

import com.inventario.model.Usuario;
import com.inventario.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin("*")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping("/login")
    public Usuario login(@RequestBody Usuario usuario) {
        return usuarioRepository.findFirstByUsuarioAndContrasena(
                usuario.getUsuario(),
                usuario.getContrasena()
        );
    }

    @GetMapping
    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    @PostMapping
    public Usuario guardarUsuario(@RequestBody Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    @DeleteMapping("/{id}")
    public void eliminarUsuario(@PathVariable Long id) {
        usuarioRepository.deleteById(id);
    }
    @PutMapping("/{id}")
public Usuario editarUsuario(@PathVariable Long id, @RequestBody Usuario usuarioActualizado) {

    Usuario usuario = usuarioRepository.findById(id).orElse(null);

    if (usuario != null) {
        usuario.setNombre(usuarioActualizado.getNombre());
        usuario.setUsuario(usuarioActualizado.getUsuario());
        usuario.setContrasena(usuarioActualizado.getContrasena());
        usuario.setRol(usuarioActualizado.getRol());

        return usuarioRepository.save(usuario);
    }

    return null;
}
}