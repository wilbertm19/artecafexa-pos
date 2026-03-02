"""
Script de prueba para verificar la conexión con Supabase
Ejecutar: python test_connection.py
"""

from supabase import create_client
from config import settings


def test_connection():
    print("🔍 Probando conexión con Supabase...")
    print(f"🌐 URL: {settings.SUPABASE_URL}")
    print()

    try:
        # Conectar
        print("1️⃣  Conectando con Supabase...")
        sb = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        print("   ✅ Conexión establecida")
        print()

        # Verificar tablas
        print("2️⃣  Verificando tablas...")
        for table in ("insumos", "productos", "recetas", "ventas"):
            rows = sb.table(table).select("*").limit(1).execute().data
            count = len(rows)
            print(f"   ✅ {table} — accesible ({count}+ registros)")
        print()

        # Verificar vistas
        print("3️⃣  Verificando vistas...")
        inv = sb.table("vista_inventario").select("*").limit(1).execute().data
        print(f"   ✅ vista_inventario — {len(inv)} registros de muestra")
        menu = sb.table("vista_menu").select("*").limit(1).execute().data
        print(f"   ✅ vista_menu — {len(menu)} registros de muestra")
        print()

        # Verificar RPC
        print("4️⃣  Verificando función RPC (dry-run)...")
        # Intentamos con un UUID inexistente — debe fallar con "no encontrado"
        try:
            sb.rpc(
                "procesar_venta",
                {"p_producto_id": "00000000-0000-0000-0000-000000000000", "p_cantidad": 1},
            ).execute()
            print("   ⚠️  RPC respondió sin error (inesperado)")
        except Exception as rpc_err:
            if "no encontrado" in str(rpc_err).lower():
                print("   ✅ procesar_venta — función accesible (error esperado: producto no encontrado)")
            else:
                print(f"   ⚠️  RPC error inesperado: {rpc_err}")
        print()

        print("=" * 50)
        print("✨ ¡Conexión exitosa! El sistema está listo.")
        print("=" * 50)
        print()
        print("Puedes iniciar el servidor con:")
        print("  python main.py")
        print()

    except Exception as e:
        print(f"❌ Error: {e}")
        print()
        print("💡 Verifica:")
        print("   1. El archivo .env existe con SUPABASE_URL y SUPABASE_KEY correctos")
        print("   2. Ejecutaste el schema.sql en el SQL Editor de Supabase")
        print("   3. Tu proyecto Supabase está activo")


if __name__ == "__main__":
    test_connection()
