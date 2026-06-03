namespace MapApi.Dtos
{
    public class CreateGeometryDto
    {
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string GeoJson { get; set; } = string.Empty;
    }
}
