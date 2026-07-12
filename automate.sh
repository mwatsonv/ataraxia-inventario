#!/bin/bash

# Script de Automatización - ERP Ataraxia Inventario
# Diseñado para verificar la calidad de código, ejecutar pruebas unitarias y realizar compilaciones de producción.

# Estilos de consola
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0;35m' # No Color

echo -e "${BLUE}======================================================================${NC}"
echo -e "${BLUE}       🚀 INICIANDO AUTOMATIZACIÓN - ERP ATARAXIA INVENTARIO        ${NC}"
echo -e "${BLUE}======================================================================${NC}"

# 1. Validación de dependencias
echo -e "\n${YELLOW}[Paso 1/3] Verificando dependencias de Node.js...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}node_modules no encontrado. Instalando dependencias de package.json...${NC}"
    npm install
else
    echo -e "${GREEN}✓ Dependencias ya instaladas.${NC}"
fi

# 2. Ejecución de Pruebas Unitarias
echo -e "\n${YELLOW}[Paso 2/3] Ejecutando pruebas unitarias de lógica de negocio...${NC}"
npm run test
TEST_RESULT=$?

if [ $TEST_RESULT -ne 0 ]; then
    echo -e "${RED}❌ ALERTA: Las pruebas unitarias fallaron. Revise los errores antes de compilar.${NC}"
    exit 1
else
    echo -e "${GREEN}✓ ¡Todas las pruebas unitarias pasaron exitosamente!${NC}"
fi

# 3. Compilación de Producción Full-Stack
echo -e "\n${YELLOW}[Paso 3/3] Compilando empaquetado optimizado de producción...${NC}"
npm run build
BUILD_RESULT=$?

if [ $BUILD_RESULT -ne 0 ]; then
    echo -e "${RED}❌ Error: La compilación del build falló.${NC}"
    exit 1
else
    echo -e "${GREEN}✓ ¡Compilación exitosa! Frontend y Backend unificados en dist/.${NC}"
fi

echo -e "\n${BLUE}======================================================================${NC}"
echo -e "${GREEN}    🎉 AUTOMATIZACIÓN COMPLETA - EL SISTEMA ESTÁ LISTO PARA OPERAR     ${NC}"
echo -e "${BLUE}    Para iniciar el servidor en producción, ejecute: ${YELLOW}npm run start${NC}"
echo -e "${BLUE}======================================================================${NC}"
