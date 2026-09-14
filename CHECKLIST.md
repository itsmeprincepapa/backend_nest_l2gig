## Checklist avant rendu

- [ ] npm install fonctionne sans erreur
- [ ] .env.example documente toutes les variables necessaires
- [ ] npm run seed cree les comptes Admin + Client
- [ ] npm run start:dev lance le serveur sur /api
- [ ] /api/docs affiche la doc Swagger complete
- [ ] Toutes les routes admin (products POST/PATCH/DELETE, orders PATCH/DELETE,
      users, dashboard) sont bloquees pour un role CLIENT (403)
- [ ] npm run test (unitaires) passe sur les 4 modules
- [ ] npm run test:e2e (scenario complet) passe
