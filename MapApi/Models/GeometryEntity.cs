using NetTopologySuite.Geometries;

namespace MapApi.Models
{
    public class GeometryEntity
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public Geometry Geometry { get; set; } = default!;
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    }
}
