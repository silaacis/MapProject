using MapApi.Models;
using Microsoft.EntityFrameworkCore;

namespace MapApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<GeometryEntity> Geometries { get; set; }
    }
}
